import re
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.exc import NoResultFound

from ..models import CountryCode
from .connection import Session, select
from .models import Blob, Destination, DestinationID


class NotFound(Exception):
    pass


def escape_for_like(value: str) -> str:
    return re.sub(r"([%_#])", r"#\1", value)


def get_blob_by_name(session: Session, name: str) -> Blob:
    try:
        return session.exec(select(Blob).where(Blob.name == name)).one()
    except NoResultFound:
        raise NotFound(f"no blob named `{name}`")


def get_destination_by_id(
    session: Session,
    id: DestinationID,
) -> Destination:
    dest = session.get(Destination, id)
    if not dest:
        raise NotFound(f"no destination with ID {id} found")
    return dest


def get_destinations_by_country(
    session: Session,
    country: CountryCode,
) -> List[Destination]:
    dests = session.exec(
        select(Destination)
        .where(Destination.country == country)
        .order_by(Destination.name)
    ).all()
    return dests


def get_destinations_by_name(
    session: Session,
    name: str,
    *,
    all_countries: bool,
    country: Optional[CountryCode],
    limit: int,
) -> List[Destination]:
    stmt = select(Destination).where(
        Destination.name.like(  # type: ignore[attr-defined]
            f"%{escape_for_like(name)}%", escape="#",
        )).limit(limit)
    # TODO: Prioritize `country` if given and `all_countries` is True.
    if not all_countries:
        if country is None:
            raise ValueError("country needs to be set")
        stmt = stmt.where(Destination.country == country)
    dests = session.exec(stmt).all()
    return dests


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
