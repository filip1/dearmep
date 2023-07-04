from contextlib import contextmanager
from typing import Optional

from sqlalchemy.future import Engine
from sqlmodel import MetaData, Session, SQLModel, create_engine, select

from ..config import Config


class AutoEngine:
    engine: Optional[Engine] = None

    @classmethod
    def get_engine(cls) -> Engine:
        if cls.engine is None:
            cls.engine = create_engine(Config.get().database.url)
        return cls.engine


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
