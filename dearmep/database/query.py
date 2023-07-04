from typing import Optional

from sqlalchemy import func
from sqlalchemy.exc import NoResultFound

from ..models import CountryCode
from .connection import Session, select
from .models import Blob, Destination


class NotFound(Exception):
    pass


def get_blob_by_name(session: Session, name: str) -> Blob:
    try:
        return session.exec(select(Blob).where(Blob.name == name)).one()
    except NoResultFound:
        raise NotFound(f"no blob named `{name}`")


def get_random_destination(
    session: Session,
    *,
    country: Optional[CountryCode] = None,
) -> Destination:
    stmt = select(Destination)
    if country:
        stmt = stmt.where(Destination.country == country)
    dest = session.exec(stmt.order_by(func.random())).first()
    if not dest:
        matching = " matching query" if country else ""
        raise NotFound(f"no destination{matching} found")
    return dest
