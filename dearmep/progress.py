from __future__ import annotations
from argparse import ArgumentParser
from collections.abc import Sized
from contextlib import contextmanager
from functools import partial
from io import BufferedReader, TextIOWrapper, UnsupportedOperation
from numbers import Real
import os
from pathlib import Path
import stat
import sys
from typing import IO, Any, Callable, Dict, Generator, Iterable, Literal, \
    Optional, Tuple, TypeVar, Union, overload
import warnings

from rich.progress import Progress as RichProgress, Task as _RichTask


class BaseTask:
    def __init__(
        self,
        description: str,
        *,
        total: Union[Sized, float, None] = None,
    ):
        self._description = description
        self._total: Optional[float] = len(total) if isinstance(total, Sized) \
            else (total if isinstance(total, Real) else None)
        self._completed = 0.

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_val is None:
            self.done()
        return False

    def advance(self, amount: float = 1.):
        self._completed += amount

    @property
    def completed(self) -> float:
        return self._completed

    @completed.setter
    def completed(self, completed: float):
        self._completed = completed

    def done(self):
        pass

    @property
    def total(self) -> Optional[float]:
        return self._total

    @total.setter
    def total(self, total: Optional[float]):
        self._total = total


class DummyTask(BaseTask):
    @classmethod
    def if_no(cls, existing_task: Optional[BaseTask] = None) -> BaseTask:
        """Return `existing_task` or, if `None`, a new `DummyTask`."""
        return existing_task if existing_task else cls("Dummy")


class RichTask(BaseTask):
    def __init__(
        self,
        description: str,
        progress: RichProgress,
        total: Union[Sized, float, None] = None,
    ):
        super().__init__(description, total=total)
        self._progress = progress
        self._id = progress.add_task(self._description, total=self._total)
        self._task = self._get_task()

    def _get_task(self) -> _RichTask:
        for task in self._progress.tasks:
            if task.id == self._id:
                return task
        raise KeyError(f"did not find task with id {self._id}")

    def advance(self, amount: float = 1.):
        self._progress.advance(self._id, amount)

    @property
    def completed(self) -> float:
        return self._task.completed

    @completed.setter
    def completed(self, completed: float):
        self._progress.update(self._id, completed=completed)

    def done(self):
        total = self._task.total
        if total is None:
            self.total = self._task.completed
        else:
            self.completed = total

    @property
    def total(self) -> Optional[float]:
        return self._task.total

    @total.setter
    def total(self, total: Optional[float]):
        self._progress.update(self._id, total=total)


class BaseTaskFactory:
    def create_task(self, description: str, **kwargs) -> BaseTask:
        raise NotImplementedError()


class DummyTaskFactory(BaseTaskFactory):
    def create_task(self, description: str, **kwargs) -> BaseTask:
        return DummyTask(description, **kwargs)


class RichTaskFactory(BaseTaskFactory):
    def __init__(self, progress: RichProgress):
        self._progress = progress

    def create_task(self, description: str, **kwargs) -> RichTask:
        return RichTask(description, self._progress, **kwargs)


SB = TypeVar("SB", str, bytes)


class TrackingMixin:
    def _with_tracking(self, val: SB, tellfunc: Callable[[], int]) -> SB:
        if self._can_tell is True and self._task:
            self._task.completed = tellfunc()
        return val

    def init_tracking(
        self,
        *,
        task: Optional[BaseTask] = None,
        can_tell: bool = False,
    ):
        self._task = task
        self._can_tell = bool(can_tell)
        fileno: Optional[int] = getattr(self, "fileno", lambda: None)()
        if self._task and fileno is not None:
            stats = os.fstat(fileno)
            # Iff the file descriptor is a regular file, we can retrieve its
            # size. Note that this also works on stdin, if it is redirected
            # from a file.
            if stat.S_ISREG(stats.st_mode):
                self._task.total = stats.st_size
        return self


# Deriving from the builtin io classes alone, in combination with
# TrackingMixin, will cause type errors with mypy even on a completely empty
# class. I don't think this is our fault, but this is why we have these "type:
# ignore" markers.


class TrackingBytesReader(BufferedReader, TrackingMixin):  # type: ignore[misc]
    def read(self, size: Optional[int] = -1) -> bytes:
        return self._with_tracking(super().read(size), self.tell)

    def read1(self, size: int = -1) -> bytes:
        return self._with_tracking(super().read1(size), self.tell)


class TrackingStrReader(TextIOWrapper, TrackingMixin):  # type: ignore[misc]
    def read(self, size: Optional[int] = -1) -> str:
        return self._with_tracking(super().read(size), self.buffer.tell)

    def readline(  # type: ignore[override]
        self,
        size: Optional[int] = -1,
    ) -> str:
        return self._with_tracking(
            super().readline(-1 if size is None else size),
            self.buffer.tell,
        )


AnyTrackingReader = Union[TrackingBytesReader, TrackingStrReader]


class FlexiReader:
    def __init__(
        self,
        input: Union[IO, Path],
        *,
        reconfigure: Dict[str, Any] = {},
    ):
        self._input = input
        self._orig_stream: Optional[IO] = None
        self._stream: Optional[IO] = None
        self._reconfigure = reconfigure
        self._did_open: bool = False
        self._task: Optional[BaseTask] = None

    @classmethod
    def add_as_argument(
        cls,
        parser: ArgumentParser,
        *names: str,
        positional: bool = True,
        required: bool = False,
        constructor_args: Dict[str, Any] = {},
        **kwargs,
    ):
        """Create an `ArgumentParser` argument that becomes a `FlexiReader`."""
        if not names:
            names = ("input",) if positional else ("-i", "--input")
        constructor = partial(
            cls.from_filename,
            dash_stdin=True,
            constructor_args=constructor_args,
        )
        omit = "" if required else " (or omit altogether)"
        kwargs = {
            "type": constructor,
            "help": f"input filename, use `-`{omit} for standard input",
            "metavar": "INPUT" if positional else "FILE",
            "default": None if required else "-",
            "nargs": "?" if not required and positional else None,
            **({"required": True} if required and not positional else {}),
            **kwargs,
        }
        parser.add_argument(
            *names,
            **kwargs,
        )

    @classmethod
    def from_filename(
        cls,
        filename: Union[str, Path],
        *,
        dash_stdin: bool = False,
        constructor_args: Dict[str, Any] = {},
    ) -> FlexiReader:
        """Create a new FlexiReader, interpreting str argument as file name."""
        if filename == "-" and dash_stdin:
            return cls(cls._stdin(), **constructor_args)
        return cls(Path(filename), **constructor_args)

    @staticmethod
    def _stdin() -> IO:
        return sys.stdin.buffer

    @overload
    def _prepare(self, open_flags: Literal["r"]) -> Tuple[IO[str], bool]:
        ...

    @overload
    def _prepare(self, open_flags: Literal["rb"]) -> Tuple[IO[bytes], bool]:
        ...

    def _prepare(self, open_flags: str) -> Tuple[IO, bool]:
        if self._stream is not None:
            raise IOError("context was already entered")
        if isinstance(self._input, Path):
            stream = self._input.open(open_flags)
            self._did_open = True  # we need to close it on exit
        else:
            stream = self._input

        # Now that the stream is opened, reconfigure it if requested.
        if self._reconfigure:
            if hasattr(stream, "reconfigure"):
                stream.reconfigure(**self._reconfigure)
            else:
                warnings.warn(
                    f"reconfiguration of stream {self._input} was requested "
                    f"({self._reconfigure}), but the stream does not support "
                    "reconfiguration"
                )

        # Check whether the stream supports tell().
        try:
            stream.tell()
            can_tell = True
        except UnsupportedOperation:
            can_tell = False

        return stream, can_tell

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self._stream is None:
            raise IOError("context was never entered")
        self._stream.close()
        if self._did_open:  # we need to close it again
            self._did_open = False
            self._orig_stream.close()
        return False

    def set_task(self, task: BaseTask):
        self._task = task


class FlexiBytesReader(FlexiReader):
    def __enter__(self) -> TrackingBytesReader:
        stream, can_tell = self._prepare("rb")

        # Put the stream into a tracking wrapper.
        self._orig_stream = stream
        self._stream: TrackingBytesReader = TrackingBytesReader(
            # TODO: can we get rid of the `type: ignore`?
            stream,  # type: ignore[arg-type]
        ).init_tracking(
            can_tell=can_tell,
            task=self._task,
        )

        return self._stream


class FlexiStrReader(FlexiReader):
    def __init__(
        self,
        input: Union[IO[str], Path],
        *,
        reconfigure: Dict[str, Any] = {},
    ):
        super().__init__(input, reconfigure=reconfigure)

    def __enter__(self) -> TrackingStrReader:
        stream, can_tell = self._prepare("r")

        # Put the stream into a tracking wrapper.
        self._orig_stream = stream
        self._stream: TrackingStrReader = TrackingStrReader(
            # TODO: can we get rid of the `type: ignore`?
            stream.buffer,  # type: ignore[attr-defined]
        ).init_tracking(
            can_tell=can_tell,
            task=self._task,
        )

        return self._stream

    @staticmethod
    def _stdin() -> IO:
        return sys.stdin

    @contextmanager
    def lines(self) -> Generator[Iterable[str], None, None]:
        with self as stream:
            def generator():
                while line := stream.readline():
                    yield line

            yield generator()
