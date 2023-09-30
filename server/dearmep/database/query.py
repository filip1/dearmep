from datetime import datetime
from typing import Callable, List, Optional, cast
from secrets import randbelow
import re

from sqlalchemy import func
from sqlalchemy.exc import NoResultFound
from sqlmodel import case

from ..models import CountryCode, DestinationSearchGroup, \
    DestinationSearchResult, SearchResult, UserPhone
from ..config import Config, Language
from .connection import Session, select
from .models import Blob, Destination, DestinationID, \
    DestinationSelectionLog, DestinationSelectionLogEvent
from ..models import PhoneNumber, hash_string
from ..database.models import PhoneNumberConfirmation
from ..database.connection import get_session


class NotFound(Exception):
    pass


def escape_for_like(value: str) -> str:
    return re.sub(r"([%_#])", r"#\1", value)


def get_available_countries(session: Session) -> List[str]:
    countries = session.exec(select(Destination.country).distinct()).all()
    return cast(List[str], countries) \
        if isinstance(countries, List) and len(countries) \
        and isinstance(countries[0], str) \
        else []


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
        .order_by(Destination.sort_name)
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
    if all_countries:
        if country is not None:
            # List countries matching the specified one first.
            stmt = stmt.order_by(case(
                (Destination.country == country, 0),
                else_=1,
            ))
    else:
        if country is None:
            raise ValueError("country needs to be set")
        stmt = stmt.where(Destination.country == country)
    stmt = stmt.order_by(Destination.sort_name)
    dests = session.exec(stmt).all()
    return dests


def get_random_destination(
    session: Session,
    *,
    country: Optional[CountryCode] = None,
    event: Optional[DestinationSelectionLogEvent] = None,
    user_id: Optional[UserPhone] = None,
    call_id: Optional[str] = None,
) -> Destination:
    stmt = select(Destination)
    if country:
        stmt = stmt.where(Destination.country == country)
    dest = session.exec(stmt.order_by(func.random())).first()
    if not dest:
        matching = " matching query" if country else ""
        raise NotFound(f"no destination{matching} found")
    if event:
        log_destination_selection(
            session,
            dest,
            event=event,
            user_id=user_id,
            call_id=call_id,
        )
    return dest


def log_destination_selection(
    session: Session,
    destination: Destination,
    *,
    event: DestinationSelectionLogEvent,
    user_id: Optional[UserPhone] = None,
    call_id: Optional[str] = None,
):
    session.add(DestinationSelectionLog(
        destination=destination,
        event=event,
        user_id=user_id,
        call_id=call_id,
    ))


def to_destination_search_result(
    destinations: List[Destination],
    blob_path: Callable[[Optional[Blob]], Optional[str]],
) -> SearchResult[DestinationSearchResult]:
    return SearchResult(
        results=[
            DestinationSearchResult(
                id=dest.id,
                name=dest.name,
                country=dest.country,
                groups=[
                    DestinationSearchGroup(
                        name=group.long_name,
                        type=group.type,
                        logo=blob_path(group.logo),
                    )
                    for group in dest.groups
                ]
            )
            for dest in destinations
        ]
    )


def get_new_sms_auth_code(phone_number_hash: str, language: Language) -> \
        str:

    code = f"{randbelow(1000000):06}"

    PNC = PhoneNumberConfirmation
    with get_session() as session:
        statement = select(PNC)\
            .where(PNC.hashed_phone_number == phone_number_hash).limit(1)
        if confirmation := session.exec(statement).first():
            confirmation.requested_verification += 1
            confirmation.code = code
        else:
            confirmation = PNC(
                hashed_phone_number=hash,
                dpp_accepted_at=datetime.now(),
                language=language,
                code=code,
                verified=False,
                requested_verification=1,
            )
        session.add(confirmation)
        session.commit()
    return code


def verify_sms_auth_code(phone_number: PhoneNumber, code: str) -> bool:
    config = Config.get()
    pepper = config.authentication.secret.pepper
    hash = hash_string(phone_number, pepper)

    PNC = PhoneNumberConfirmation
    statement = select(PNC).where(PNC.hashed_phone_number == hash,
                                  PNC.code == code).limit(1)
    with get_session() as session:
        if confirmation := session.exec(statement).first():
            confirmation.verified = True
            session.add(confirmation)
            session.commit()
            return True
        return False
