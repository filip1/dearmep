from __future__ import annotations
from argparse import ArgumentParser
from contextlib import contextmanager
from functools import partial
import io
import os
from pathlib import Path
import sys
from typing import IO, Any, Dict, Optional, Union
import warnings

from rich.progress import Progress as RichProgress, Task as _RichTask


class BaseTask:
    def __init__(
        self,
        description: str,
        *,
        total: Optional[float] = None,
    ):
        self._description = description
        self._total = total
        self._completed = 0.

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_val is None:
            self.done()
        return False

    def advance(self, amount: float):
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
    def if_no(cls, existing_task: Optional[BaseTask]) -> BaseTask:
        return existing_task if existing_task else cls("Dummy")


class RichTask(BaseTask):
    def __init__(
        self,
        description: str,
        progress: RichProgress,
        total: Optional[float] = None,
    ):
        super().__init__(description, total=total)
        self._progress = progress
        self._id = progress.add_task(self._description, total=total)
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


class FlexiReader:
    def __init__(
        self,
        input: Union[IO[str], Path],
        *,
        reconfigure: Dict[str, Any] = {},
    ):
        self._input = input
        self._stream: Optional[IO[str]] = None
        self._reconfigure = reconfigure
        self._did_open = False
        self.task = None
        self.can_tell: Optional[bool] = None

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
            return cls(sys.stdin, **constructor_args)
        return cls(Path(filename), **constructor_args)

    def __enter__(self) -> IO[str]:
        if self._stream is not None:
            raise IOError("context was already entered")
        if isinstance(self._input, Path):
            self._stream = self._input.open("r")
            self._did_open = True
        else:
            self._stream = self._input
        if self._reconfigure:
            if hasattr(self._stream, "reconfigure"):
                self._stream.reconfigure(**self._reconfigure)
            else:
                warnings.warn(
                    f"reconfiguration of stream {self._input} was requested "
                    f"({self._reconfigure}), but the stream does not support "
                    "reconfiguration"
                )

        try:
            self._stream.tell()
            self.can_tell = True
        except io.UnsupportedOperation:
            self.can_tell = False

        return self._stream

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self._stream is None:
            raise IOError("context was never entered")
        if self._did_open:
            self._stream.close()
        return False

    @property
    def task(self) -> Optional[BaseTask]:
        return self._task

    @task.setter
    def task(self, task: Optional[BaseTask]):
        self._task = DummyTask.if_no(task)

    @contextmanager
    def lines(self):
        with self as stream:
            size = self.size
            if size is not None:
                self._task.total = size

            def generator():
                while line := stream.readline():
                    yield line
                    if self.can_tell:
                        self._task.completed = stream.tell()

            yield generator()

    @property
    def size(self) -> Optional[int]:
        stream = self._stream
        if not (stream and hasattr(stream, "fileno")):
            return None
        size = os.fstat(stream.fileno()).st_size
        # Non-file streams like stdin will have a size of 0, but can be
        # distinguished from 0-byte files by whether tell() is working.
        if size == 0 and not self.can_tell:
            return None
        return size
