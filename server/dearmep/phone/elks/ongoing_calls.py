# SPDX-FileCopyrightText: © 2023 iameru
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from datetime import datetime, timezone
from typing import cast

from sqlalchemy import and_, select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import joinedload
from sqlmodel import Session, col

from ...config import Language
from ...database.models import Call, Destination
from ...models import CallType, UserPhone


class CallError(Exception):
    pass


def get_call(
    callid: str,
    provider: str,
    session: Session,
) -> Call:
    try:
        return cast(
            "Call",
            session.query(Call)
            .filter(Call.provider_call_id == callid)
            .filter(Call.provider == provider)
            .options(
                joinedload(Call.destination).joinedload(Destination.contacts)
            )
            .one(),
        )
    except NoResultFound as e:
        raise CallError(f"Call {callid=}, {provider=} not found") from e


def remove_call(call: Call, session: Session) -> None:
    """removes a call from the database"""
    session.delete(call)
    session.commit()


def connect_call(call: Call, session: Session) -> None:
    """sets a call as connected in database"""
    call.connected_at = datetime.now(timezone.utc)
    session.add(call)
    session.commit()


def destination_is_in_call(destination_id: str, session: Session) -> bool:
    """returns True if the destination is in a call"""
    stmt = (
        select(Call)
        .where(
            and_(
                Call.destination_id == destination_id,
                col(Call.connected_at).isnot(None),
            )
        )
        .exists()
    )
    return bool(session.query(stmt).scalar())


def user_is_in_call(user_id: UserPhone, session: Session) -> bool:
    """returns True if the user is in a call"""
    stmt = select(Call).where(Call.user_id == user_id).exists()
    return bool(session.query(stmt).scalar())


def add_call(  # noqa: PLR0913
    *,
    provider: str,
    provider_call_id: str,
    destination_id: str,
    user_language: Language,
    user_id: str,
    type: CallType,
    started_at: datetime,
    session: Session,
) -> Call:
    """adds a call to the database"""
    call = Call(
        provider=provider,
        provider_call_id=provider_call_id,
        destination_id=destination_id,
        user_language=user_language,
        user_id=user_id,
        started_at=started_at,
        type=type,
    )
    session.add(call)
    session.commit()
    return get_call(provider_call_id, provider, session)


def get_mep_number(call: Call) -> str:
    """returns the MEP number of the call"""
    query = [x for x in call.destination.contacts if x.type == "phone"]
    try:
        return query[0].contact
    except IndexError:
        raise CallError(
            f"Destination {call.destination_id} has no phone number to call"
        ) from None
