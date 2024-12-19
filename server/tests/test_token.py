# SPDX-FileCopyrightText: © 2024 Jörn Bethune & Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from datetime import datetime, timedelta, timezone
from json import loads

import jwt
import pytest
from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient
from jwt.exceptions import ExpiredSignatureError
from sqlmodel import Session, col, select

from dearmep.api.v1 import request_number_verification, verify_number
from dearmep.config import Config
from dearmep.database.models import NumberVerificationRequest
from dearmep.models import (
    JWTClaims,
    JWTResponse,
    PhoneNumberVerificationRequest,
    PhoneNumberVerificationResponse,
    SMSCodeVerificationRequest,
    UserPhone,
)


phone_number = "+491751234567"


def test_authentication_flow(fastapi_app: FastAPI, session: Session):
    jwt_config = Config.load().authentication.secrets.jwt

    request = PhoneNumberVerificationRequest(
        language="de", phone_number=phone_number, accepted_dpp=True
    )

    # side effect: Insert confirmation code in the database
    response = request_number_verification(request)
    assert isinstance(response, PhoneNumberVerificationResponse)
    assert response.phone_number == phone_number

    user = UserPhone(request.phone_number)

    # let's look up the right code in the database
    confirmation_code = session.exec(
        select(NumberVerificationRequest)
        .where(
            NumberVerificationRequest.user == user,
            col(NumberVerificationRequest.ignore).is_(False),
            col(NumberVerificationRequest.completed_at).is_(None),
            NumberVerificationRequest.expires_at > datetime.now(timezone.utc),
        )
        .order_by(col(NumberVerificationRequest.requested_at).desc())
    ).one()

    bearer_token = verify_number(
        SMSCodeVerificationRequest(
            phone_number=phone_number, code=confirmation_code.code
        )
    )
    assert isinstance(bearer_token, JWTResponse)

    jwt_claims = jwt.decode(
        bearer_token.access_token,
        jwt_config.key,
        algorithms=jwt_config.algorithms,
        options={"require_exp": True},
    )
    claims = JWTClaims.parse_obj(jwt_claims)
    assert claims.phone == phone_number


def test_incorrect_sms_code(session: Session):
    request = PhoneNumberVerificationRequest(
        language="de", phone_number=phone_number, accepted_dpp=True
    )

    # create an entry server-side for good measure
    request_number_verification(request)
    # but don't make any attempt to receive the code
    # and provide a code that is guaranteed to be wrong
    response = verify_number(
        SMSCodeVerificationRequest(
            phone_number=phone_number,
            code="blabla",  # we expect the real code to be a number
        )
    )

    assert isinstance(response, JSONResponse)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert loads(response.body.decode())["error"] == "CODE_VERIFICATION_FAILED"


def test_expired_token(fastapi_app: FastAPI, client: TestClient):
    jwt_config = Config.load().authentication.secrets.jwt

    one_day = timedelta(days=1)
    now = datetime.now(timezone.utc)
    one_day_ago = now - one_day
    in_one_day = now + one_day

    expired_token = jwt.encode(
        JWTClaims(phone=phone_number, exp=one_day_ago).dict(),
        jwt_config.key,
        algorithm=jwt_config.algorithms[0],
    )
    fresh_token = jwt.encode(
        JWTClaims(phone=phone_number, exp=in_one_day).dict(),
        jwt_config.key,
        algorithm=jwt_config.algorithms[0],
    )

    url = "/api/v1/schedule"
    headers = {"encoding": "UTF-8"}

    # make a request without any token
    response = client.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN

    # make a request with the expired token
    headers["Authorization"] = f"Bearer {expired_token}"
    with pytest.raises(ExpiredSignatureError) as e_info:
        response = client.get(url, headers=headers)
    assert str(e_info.value) == "Signature has expired"
    assert response.status_code == status.HTTP_403_FORBIDDEN

    # make a request with a fresh token
    headers["Authorization"] = f"Bearer {fresh_token}"
    response = client.get(url, headers=headers)
    assert response.status_code == status.HTTP_200_OK
