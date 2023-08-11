from contextlib import contextmanager
import threading
from typing import Dict

from prometheus_client import Gauge

from sqlalchemy.future import Engine
from sqlmodel import MetaData, Session, SQLModel, create_engine, select

from ..config import Config


database_engine_refs_total = Gauge(
    "database_engine_refs_total",
    "Number of database engine instances held by the AutoEngine class. This "
    "should be one per thread on non-threadsafe database engines, else 1.",
)


class AutoEngine:
    # The engine for each thread, if one has been created already.
    engines: Dict[int, Engine] = {}

    @staticmethod
    def engine_is_threadsafe(config: Config) -> bool:
        """Whether the engine in the config can be considered threadsafe.

        Note that SQLite _can_ be threadsafe (see `sqlite3.threadsafety`), but
        due to `check_same_thread` in `sqlite3.connect()` defaulting to `True`,
        even when `sqlite3.threadsafety == 3`, we cannot consider this here."""
        return not config.database.url.startswith("sqlite")

    @classmethod
    def get_engine(cls) -> Engine:
        """Get a (possibly cached) database engine instance."""
        thread_id = threading.get_ident()
        # If this thread has a cached engine, return that.
        if thread_id in cls.engines:
            return cls.engines[thread_id]
        # If there is a global engine for all threads, return that.
        if 0 in cls.engines:
            return cls.engines[0]
        # No cached engine available.

        # Check whether we can create a global instance for the DBMS we use.
        config = Config.get()
        if cls.engine_is_threadsafe(config):
            thread_id = 0

        # Create, cache, and return the engine.
        e = cls.engines[thread_id] = create_engine(Config.get().database.url)
        database_engine_refs_total.set(len(cls.engines))
        return e


def get_metadata() -> MetaData:
    return SQLModel.metadata


@contextmanager
def get_session():
    with Session(AutoEngine.get_engine()) as session:
        yield session


def create_db() -> None:
    SQLModel.metadata.create_all(AutoEngine.get_engine())


__all__ = [
    "Session",
    "get_session",
    "select",
]
