# SPDX-FileCopyrightText: © 2023 Jörn Bethune
# SPDX-FileCopyrightText: © 2023 Tim Weber
# SPDX-FileCopyrightText: © 2023 iameru
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from logging import getLogger
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


_logger = getLogger(__name__)


class DeveloperPhoneService(AbstractPhoneService):
    """
    A phone service implementation that can be used while
    developing/debugging an application. This implementation is always
    in dry run mode and logs the simulated actions with the default
    Python logging framework at the INFO level.
    """

    def send_sms(  # noqa: PLR6301
        self,
        *,
        recipient: PhoneNumber,
        content: str,
        sender: SMSSenderName,  # noqa: ARG002
    ) -> None:
        """
        Show a [SMS] log file message
        """
        _logger.info(f"[SMS] {recipient}: {content}")

    def establish_call(  # noqa: PLR6301
        self,
        *,
        user_phone: PhoneNumber,
        type_of_call: CallType,  # noqa: ARG002
        destination_id: DestinationID,
        language: Language,  # noqa: ARG002
        session: Session,  # noqa: ARG002
    ) -> Union[CallState, DestinationInCallResponse, UserInCallResponse]:
        _logger.info(f"[CALL] {user_phone} <-> {destination_id} simulated")
        return CallState.CALLING_USER
