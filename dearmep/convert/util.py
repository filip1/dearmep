from contextlib import contextmanager
from functools import lru_cache
from os import PathLike
from sys import stdin, stdout
from typing import IO, Iterator, List, Optional, Tuple, Union

import lzip  # type: ignore
from rich.console import Console
from rich.progress import Progress
from rich.table import Table as RichTable


InputFile = Union[str, PathLike]
OutputFile = Union[str, PathLike]


@contextmanager
def decompressed_lz_stream(
    file: InputFile,
    *,
    progress: Progress,
    description: str = "Decompressing lzip file",
) -> Iterator[IO[bytes]]:
    with open_file_for_read(
        file, progress=progress, description=description
    ) as f:
        yield lzip.decompress_file_like_iter(f)


@lru_cache
def get_console() -> Console:
    return Console(stderr=True)


@contextmanager
def indeterminate_task(
    progress: Progress,
    description: str,
):
    task = progress.add_task(description, total=None)
    yield
    progress.update(task, total=1, completed=1)


@contextmanager
def open_file_for_read(
    file: InputFile,
    *,
    progress: Progress,
    description: str = "Reading file",
) -> Iterator[IO[bytes]]:
    if file == "-":
        with indeterminate_task(progress, description):
            yield stdin.buffer
    else:
        with progress.open(
            file, "rb", description=description,
        ) as f:
            yield f


@contextmanager
def open_file_for_write(
    file: OutputFile,
) -> Iterator[IO[str]]:
    if file == "-":
        yield stdout
    else:
        with open(file, "w") as f:
            yield f


@contextmanager
def progress(console: Optional[Console] = None) -> Iterator[Progress]:
    with Progress(console=console or get_console()) as progress:
        yield progress


class Table:
    def __init__(self, *columns: str):
        self._columns = columns
        self._rows: List[Tuple[str, ...]] = []

    def __len__(self) -> int:
        return len(self._rows)

    def __getitem__(self, key: int) -> Tuple[str, ...]:
        return self._rows[key]

    def add_row(self, *row: str):
        if len(row) != len(self._columns):
            raise ValueError(
                f"row has {len(row)} item(s), expected {len(self._columns)}")
        self._rows.append(row)

    def as_rich_table(self) -> RichTable:
        t = RichTable(*self._columns)
        for row in self._rows:
            t.add_row(*row)
        return t

    @property
    def columns(self) -> List[str]:
        return list(self._columns)
