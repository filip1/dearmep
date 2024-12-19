# SPDX-FileCopyrightText: © 2023 Jörn Bethune
# SPDX-FileCopyrightText: © 2023 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from datetime import datetime, timezone
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import ValidationError

from ..config import Config
from ..models import JWTClaims, JWTResponse, PhoneNumber


bearer_scheme = HTTPBearer(
    auto_error=True,
)


def create_token(phone: PhoneNumber) -> JWTResponse:
    """Get an encrypted token to claim a particular phone number."""
    auth_config = Config.get().authentication
    jwt_config = auth_config.secrets.jwt
    timeout = auth_config.session.authentication_timeout
    valid_until = datetime.now(timezone.utc) + timeout
    token = jwt.encode(
        JWTClaims(phone=phone, exp=valid_until).dict(),
        jwt_config.key,
        algorithm=jwt_config.algorithms[0],
    )
    return JWTResponse(access_token=token, expires_in=timeout.total_seconds())


def validate_token(
    token: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
) -> JWTClaims:
    """Validate a JWT and return the signed claims it contains."""
    jwt_config = Config.get().authentication.secrets.jwt
    try:
        claims_dict = jwt.decode(
            token.credentials.encode("utf-8"),
            jwt_config.key,
            algorithms=jwt_config.algorithms,
            options={"require_exp": True},
        )
        claims = JWTClaims.parse_obj(claims_dict)
    except (ValidationError, jwt.InvalidTokenError) as e:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "JWT expired"
            if isinstance(e, jwt.ExpiredSignatureError)
            else "invalid JWT",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    return claims
