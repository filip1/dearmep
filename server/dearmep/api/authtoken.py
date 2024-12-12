# SPDX-FileCopyrightText: © 2023 Jörn Bethune
# SPDX-FileCopyrightText: © 2023 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError

from ..config import Config
from ..models import JWTClaims, JWTResponse, PhoneNumber


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/number-verification/request",
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
    token: Annotated[str, Depends(oauth2_scheme)],
) -> JWTClaims:
    """Validate a JWT and return the signed claims it contains."""
    jwt_config = Config.get().authentication.secrets.jwt
    try:
        claims_dict = jwt.decode(
            token,
            jwt_config.key,
            algorithms=jwt_config.algorithms,
            options={"require_exp": True},
        )
        claims = JWTClaims.parse_obj(claims_dict)
    except (JWTError, ValidationError) as e:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "invalid JWT",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    if claims.exp <= datetime.now(timezone.utc):
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "JWT expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return claims
