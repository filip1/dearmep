from typing import Union

from .elks import elks
from .abstract import AbstractPhoneService
from ..database.connection import Session
from ..database.models import DestinationID
from ..models import CallState, DestinationInCallResponse, Language, \
    PhoneNumber, SMSSenderName, UserInCallResponse


class ElksPhoneService(AbstractPhoneService):
    def send_sms(
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

    def establish_call(
        self,
        *,
        user_phone: PhoneNumber,
        destination_id: DestinationID,
        language: Language,
        session: Session,
    ) -> Union[CallState, DestinationInCallResponse, UserInCallResponse]:
        return elks.start_elks_call(
            user_phone_number=user_phone,
            user_language=language,
            destination_id=destination_id,
            session=session,
        )
