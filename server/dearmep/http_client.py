# SPDX-FileCopyrightText: © 2023 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

import logging
from pathlib import Path
from queue import Empty, Queue
from threading import Thread
from typing import Literal, Optional, Union

import backoff
import httpx
from ratelimit import RateLimitException, limits  # type: ignore[import]

from . import __version__
from .config import APP_NAME
from .progress import BaseTask, DummyTask


_logger = logging.getLogger(__name__)


DEFAULT_MASS_DOWNLOAD_JOBS = 3


def new_session() -> httpx.Client:
    return httpx.Client(
        headers={
            "User-Agent": f"{APP_NAME} {__version__}",
        }
    )


def session_or_new(session: Optional[httpx.Client]) -> httpx.Client:
    return session or new_session()


def _permanent_download_error(e: Exception) -> bool:
    """Whether a HTTP error is considered permanent & retrying should stop."""
    if isinstance(e, RateLimitException):
        return False
    if not isinstance(e, httpx.HTTPError):
        return True
    req = (
        e.request
        if isinstance(e, (httpx.RequestError, httpx.HTTPStatusError))
        else None
    )
    res = e.response if isinstance(e, httpx.HTTPStatusError) else None
    url = str(req.url) if req else "[unknown URL]"
    if res is None:
        _logger.warning(
            f"downloading {url} failed without a response, will retry"
        )
        return False  # network error? server unreachable?
    code = res.status_code
    permanent = (400 <= code < 500) and (code != 429)  # noqa: PLR2004
    if permanent:
        _logger.error(f"{code} when downloading {url}, giving up")
    else:
        _logger.warning(f"{code} when downloading {url}, will retry")
    return permanent


class MassDownloader:
    def __init__(  # noqa: PLR0913
        self,
        *,
        jobs: int = DEFAULT_MASS_DOWNLOAD_JOBS,
        session: Optional[httpx.Client] = None,
        task: Optional[BaseTask] = None,
        overwrite: bool = False,
        skip_existing: bool = False,
        accept_error_codes: Union[Literal[True], set[int], None] = None,
        ignore_error_codes: Union[Literal[True], set[int], None] = None,
    ) -> None:
        self._jobs = jobs
        self._session = session_or_new(session)
        self._task = DummyTask.if_no(task)
        self._task.total = 0
        self._overwrite = overwrite
        self._skip_existing = skip_existing
        self._accept_codes = (
            set() if accept_error_codes is None else accept_error_codes
        )
        self._ignore_codes = (
            set() if ignore_error_codes is None else ignore_error_codes
        )
        self._queue: Queue[tuple[str, Path]] = Queue()
        self._mgmt_thread: Optional[Thread] = None
        self._should_run: bool = False
        self._abort: bool = False
        self.errors: list[tuple[str, httpx.Response]] = []

    @backoff.on_exception(
        backoff.expo,
        (httpx.HTTPError, RateLimitException),
        giveup=_permanent_download_error,
        max_time=120,
    )
    @limits(calls=1, period=0.2)  # 5 calls spread over 1 second
    def _fetch(self, url: str) -> bytes:
        """Load URL's contents, retrying with backoff."""
        res = self._session.get(url)
        if (
            self._accept_codes is not True
            and res.status_code not in self._accept_codes
        ):
            res.raise_for_status()
        return res.content

    def _download(self, url: str, dest: Path) -> None:
        """Load URL's contents and save at destination."""
        if not dest.parent.is_dir():
            raise FileNotFoundError(f'"{dest.parent}" is not a directory')
        if dest.exists():
            if self._skip_existing:
                return  # We're done early, I guess.
            if not self._overwrite:
                # This check is done before downloading, to be nice to the
                # server we're downloading from.
                raise FileExistsError(f'"{dest}" already exists')

        _logger.debug(f"downloading {url} to {dest}")
        # TODO: Stream into the file instead of keeping it in RAM. Could become
        # interesting when being combined with retry logic though.
        content = self._fetch(url)

        if not self._overwrite and dest.exists():
            raise FileExistsError(f'"{dest}" already exists')
        dest.write_bytes(content)

    def _queue_worker(self) -> None:
        """Single thread processing the queue."""
        while self._should_run:
            try:
                url, dest = self._queue.get(timeout=0.1)
            except Empty:
                continue
            try:
                self._download(url, dest)
            except httpx.HTTPStatusError as e:
                if (
                    self._ignore_codes is True
                    or e.response.status_code in self._ignore_codes
                ):
                    self.errors.append((url, e.response))
                else:
                    self._abort = True
                    self._should_run = False
                    raise
            except httpx.HTTPError:
                self._abort = True
                self._should_run = False
                raise
            except BaseException:
                self._abort = True
                self._should_run = False
                raise
            finally:
                self._queue.task_done()
                self._task.advance()

    def _manage(self) -> None:
        """Main background thread managing the queue threads."""
        workers: list[Thread] = []
        for i in range(self._jobs):
            thread = Thread(
                target=self._queue_worker,
                name=f"MassDownloadWorker{i + 1}",
                daemon=True,
            )
            workers.append(thread)
            thread.start()
        for thread in workers:
            thread.join()
        if self._abort:
            # Drain the queue so that the .join() on it terminates.
            while True:
                try:
                    self._queue.get(block=False)
                    self._queue.task_done()
                except Empty:
                    break

    def add(self, url: str, dest: Path) -> None:
        """Enqueue a URL to download to a location."""
        self._queue.put((url, dest))
        if self._task.total is not None:
            self._task.total += 1

    def start(self) -> None:
        """Start the processing of downloads in a background thread."""
        self._mgmt_thread = Thread(
            target=self._manage,
            name="MassDownloadMgmt",
            daemon=True,
        )
        self._abort = False
        self._should_run = True
        self._mgmt_thread.start()

    def stop(self, wait: bool = True) -> None:
        """Stop processing downloads, optionally waiting for queue to empty."""
        try:
            if wait:
                self._queue.join()
            self._should_run = False
            if wait and self._mgmt_thread:
                self._mgmt_thread.join()
        except KeyboardInterrupt:
            self._abort = True
        except BaseException:
            self._abort = True
            raise
        finally:
            self._should_run = False
