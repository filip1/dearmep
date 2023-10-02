from datetime import datetime, timedelta
from typing import Callable, List, Optional, Union, cast
from secrets import randbelow
import re

from sqlalchemy import func
from sqlalchemy.exc import NoResultFound
from sqlmodel import case

from ..config import Config
from ..models import CountryCode, DestinationSearchGroup, \
    DestinationSearchResult, Language, PhoneRejectReason, SearchResult, \
    UserPhone, VerificationCode
from .connection import Session, select
from .models import Blob, BlockReason, Destination, DestinationID, \
    DestinationSelectionLog, DestinationSelectionLogEvent, \
    NumberVerificationRequest, UserBlock, UserSignIn


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


def get_new_sms_auth_code(
    session: Session,
    *,
    user: UserPhone,
    language: Language,
) -> Union[PhoneRejectReason, VerificationCode]:
    config = Config.get()
    now = datetime.now()

    # Block the user if they have too many open verification requests. We are
    # deliberately also considering expired requests here, to prevent someone
    # spamming a victim's number with codes by simply doing it _slowly_.
    open_requests = session.scalar(
        select(func.count())  # type: ignore[call-overload]
        .where(NumberVerificationRequest.user == user)
    )
    if open_requests >= config.authentication.session.max_unused_codes:
        session.add(UserBlock(
            user=user, reason=BlockReason.TOO_MANY_VERIFICATION_REQUESTS))
        session.commit()
        return PhoneRejectReason.TOO_MANY_VERIFICATION_REQUESTS

    code = VerificationCode(f"{randbelow(1_000_000):06}")

    # TODO: Handle index violation due to duplicate codes.
    session.add(NumberVerificationRequest(
        user=user,
        code=code,
        requested_at=now,
        expires_at=now + timedelta(minutes=10),  # TODO: make configurable
        language=language,
    ))

    return code


def verify_sms_auth_code(
    session: Session,
    *,
    user: UserPhone,
    code: VerificationCode,
) -> bool:
    if confirmation := session.exec(
        select(NumberVerificationRequest)
        .where(
            NumberVerificationRequest.user == user,
            NumberVerificationRequest.code == code,
            NumberVerificationRequest.expires_at > datetime.now(),
        )
    ).first():
        session.add(UserSignIn(
            user=user,
            initiated_at=confirmation.requested_at,
            language=confirmation.language,
        ))
        session.delete(confirmation)
        return True
    return False


def get_block_reason(
    session: Session,
    user: UserPhone,
) -> Optional[BlockReason]:
    if entry := session.exec(
        select(UserBlock).where(UserBlock.user == user)
    ).first():
        return entry.reason
    return None
