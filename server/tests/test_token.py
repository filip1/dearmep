# SPDX-FileCopyrightText: © 2024 Jörn Bethune
# SPDX-FileCopyrightText: © 2024 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from datetime import datetime, timedelta, timezone

import jwt
from fastapi import FastAPI, status
from fastapi.testclient import TestClient
from sqlmodel import Session, col, select

from dearmep.config import Config
from dearmep.database.models import NumberVerificationRequest
from dearmep.models import (
    JWTClaims,
    PhoneNumberVerificationRequest,
    UserPhone,
)


phone_number = "+491751234567"


def test_authentication_flow(client: TestClient, session: Session):
    jwt_config = Config.load().authentication.secrets.jwt

    request = PhoneNumberVerificationRequest(
        language="de", phone_number=phone_number, accepted_dpp=True
    )

    # side effect: Insert confirmation code in the database
    response = client.post(
        "/api/v1/number-verification/request",
        json={
            "language": "de",
            "phone_number": phone_number,
            "accepted_dpp": True,
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "phone_number" in data
    assert data["phone_number"] == phone_number

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

    response = client.post(
        "/api/v1/number-verification/verify",
        json={
            "phone_number": phone_number,
            "code": confirmation_code.code,
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["token_type"] == "Bearer"  # noqa: S105
    assert isinstance(data["access_token"], str)

    jwt_claims = jwt.decode(
        data["access_token"],
        jwt_config.key,
        algorithms=jwt_config.algorithms,
        options={"require_exp": True},
    )
    claims = JWTClaims.parse_obj(jwt_claims)
    assert claims.phone == phone_number


def test_incorrect_sms_code(client: TestClient, session: Session):
    # create an entry server-side for good measure
    response = client.post(
        "/api/v1/number-verification/request",
        json={
            "language": "de",
            "phone_number": phone_number,
            "accepted_dpp": True,
        },
    )
    assert response.status_code == status.HTTP_200_OK

    # but don't make any attempt to receive the code
    # and provide a code that is guaranteed to be wrong
    response = client.post(
        "/api/v1/number-verification/verify",
        json={
            "phone_number": phone_number,
            "code": "blabla",  # we expect the real code to be a number
        },
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["error"] == "CODE_VERIFICATION_FAILED"


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
    response = client.get(url, headers=headers)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "JWT expired"

    # make a request with a fresh token
    headers["Authorization"] = f"Bearer {fresh_token}"
    response = client.get(url, headers=headers)
    assert response.status_code == status.HTTP_200_OK
