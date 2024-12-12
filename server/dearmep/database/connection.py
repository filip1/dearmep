# SPDX-FileCopyrightText: © 2023 Tim Weber
# SPDX-FileCopyrightText: © 2023 iameru
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from __future__ import annotations

from contextlib import contextmanager
from typing import TYPE_CHECKING

from sqlmodel import MetaData, Session, SQLModel, create_engine, select, text

from ..config import Config


if TYPE_CHECKING:
    from collections.abc import Iterator

    from sqlalchemy.future import Engine


class NotThreadsafeError(Exception):
    """The selected database engine is not available in a threadsafe way."""


class AutoEngine:
    engine: Engine | None = None

    @staticmethod
    def create_sqlite_engine(config: Config) -> Engine:
        """Create an SQLite engine and check for thread safety.

        SQLite can be non-threadsafe, depending on how it has been compiled and
        configured at runtime. Since we regularly ran into problems with
        sporadic sqlite3.ProgrammingError exceptions being raised because
        SQLAlchemy or FastAPI or someone was sharing connections across thread
        boundaries, we decided to make a threadsafe SQLite mandatory.

        If SQLite has been compiled with SQLITE_THREADSAFE=1 or 2, the thread
        safety can be configured at runtime. However, Python's default sqlite3
        module does not seem to provide an interface for this. Therefore, we
        request the value of the compile option to check whether SQLite is
        threadsafe, and assume that that's also the value being applied to our
        connection (since we have no way of changing it).

        THREADSAFE=2 requires some guarantees from the program (i.e. us) that
        we can't give, so the only supported mode of operation is THREADSAFE=1.

        Note that sqlite3.threadsafety cannot be relied upon, as it was
        hardcoded to 1 (i.e. "connections may not be shared between threads")
        until Python 3.11.

        See also:
        <https://sqlite.org/threadsafe.html>
        <https://sqlite.org/compile.html#threadsafe>
        <https://peps.python.org/pep-0249/#threadsafety>
        """
        engine = create_engine(
            config.database.url,
            connect_args={
                "check_same_thread": False,
            },
        )
        # Check whether SQLite has been compiled with thread safety.
        with Session(engine) as session:
            res = session.execute(
                text("""
                select compile_options from pragma_compile_options
                where compile_options like 'THREADSAFE=%'
            """)
            ).one()
            if res[0] != "THREADSAFE=1":
                raise NotThreadsafeError(
                    "SQLite3 library needs to have been compiled with "
                    "SQLITE_THREADSAFE=1; instead it has been compiled with "
                    f"SQLITE_{res[0]}"
                )
        return engine

    @classmethod
    def get_engine(cls) -> Engine:
        if cls.engine is None:
            config = Config.get()
            cls.engine = (
                cls.create_sqlite_engine(config)
                if config.database.url.startswith("sqlite")
                else create_engine(config.database.url)
            )
        return cls.engine


def get_metadata() -> MetaData:
    return SQLModel.metadata


@contextmanager
def get_session() -> Iterator[Session]:
    with Session(AutoEngine.get_engine()) as session:
        yield session


__all__ = [
    "Session",
    "get_session",
    "select",
]
