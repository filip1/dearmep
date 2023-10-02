from datetime import datetime, timedelta
from typing import Callable, Dict, List, NamedTuple, Optional, Union, cast
from secrets import randbelow
import re

from sqlalchemy import func
from sqlalchemy.exc import NoResultFound
from sqlalchemy.sql import label
from sqlmodel import case, col

from ..config import Config
from ..models import CountryCode, DestinationSearchGroup, \
    DestinationSearchResult, Language, PhoneRejectReason, SearchResult, \
    UserPhone, VerificationCode
from .connection import Session, select
from .models import Blob, Destination, DestinationID, \
    DestinationSelectionLog, DestinationSelectionLogEvent, \
    NumberVerificationRequest


class NotFound(Exception):
    pass


class NumberVerificationRequestCount(NamedTuple):
    """The number of incomplete & completed number verification requests."""
    incomplete: int = 0
    complete: int = 0


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


def get_number_verification_count(
    session: Session,
    *,
    user: UserPhone,
) -> NumberVerificationRequestCount:
    """Get the number of completed & incomplete phone number verifications.

    We are deliberately also considering expired requests here, to prevent
    someone spamming a victim's number with codes by simply doing it _slowly_,
    or to prevent people from logging in 100 times during the course of a day.
    """
    request_counts: Dict[bool, int] = dict(session.exec(
        select(  # type: ignore[call-overload]
            label("completed", case(
                (col(NumberVerificationRequest.completed_at).is_(None), False),
                else_=True,
            )),
            label("count", func.count()),
        ).group_by("completed")
        .where(
            NumberVerificationRequest.user == user,
            col(NumberVerificationRequest.ignore).is_(False),
        )
    ).all())

    return NumberVerificationRequestCount(**{
        "complete" if k else "incomplete": v
        for k, v in request_counts.items()
    })


def get_new_sms_auth_code(
    session: Session,
    *,
    user: UserPhone,
    language: Language,
) -> Union[PhoneRejectReason, VerificationCode]:
    """Generate SMS verification code & store it in the database."""
    config = Config.get()
    now = datetime.now()

    # Reject the user if they have too many open verification requests.
    counts = get_number_verification_count(session, user=user)

    if counts.incomplete >= config.authentication.session.max_unused_codes:
        return PhoneRejectReason.TOO_MANY_VERIFICATION_REQUESTS
    # TODO: Also check completed logins.

    code = VerificationCode(f"{randbelow(1_000_000):06}")

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
    """Check SMS verification code validity & mark as used."""
    if request := session.exec(
        select(NumberVerificationRequest)
        .where(
            NumberVerificationRequest.user == user,
            NumberVerificationRequest.code == code,
            col(NumberVerificationRequest.ignore).is_(False),
            col(NumberVerificationRequest.completed_at).is_(None),
            NumberVerificationRequest.expires_at > datetime.now(),
        ).order_by(col(NumberVerificationRequest.requested_at).desc())
    ).first():
        request.completed_at = datetime.now()
        return True
    return False
