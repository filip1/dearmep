# SPDX-FileCopyrightText: © 2023 Tim Weber
# SPDX-FileCopyrightText: © 2023 iameru
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from typing import Union

from ..database.connection import Session
from ..database.models import DestinationID
from ..models import (
    CallState,
    CallType,
    DestinationInCallResponse,
    Language,
    PhoneNumber,
    SMSSenderName,
    UserInCallResponse,
)
from .abstract import AbstractPhoneService
from .elks import elks


class ElksPhoneService(AbstractPhoneService):
    def send_sms(  # noqa: PLR6301
        self,
        *,
        recipient: PhoneNumber,
        content: str,
        sender: SMSSenderName,
    ) -> None:
        elks.send_sms(
            user_phone_number=recipient,
            from_title=sender,
            message=content,
        )

    def establish_call(  # noqa: PLR6301
        self,
        *,
        user_phone: PhoneNumber,
        type_of_call: CallType,
        destination_id: DestinationID,
        language: Language,
        session: Session,
    ) -> Union[CallState, DestinationInCallResponse, UserInCallResponse]:
        return elks.start_elks_call(
            user_phone_number=user_phone,
            type_of_call=type_of_call,
            user_language=language,
            destination_id=destination_id,
            session=session,
        )
