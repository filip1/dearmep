from datetime import timedelta, datetime

from typing import Dict
from typing_extensions import Annotated  # NOTE: Python 3.9 moved into `typing`

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import BaseModel

from ..config import Config

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="")  # bearer is a jwt token


class AuthToken(BaseModel):
    access_token: str  # JWT token
    token_type: str  # always "bearer"


class PhoneNumberClaim(BaseModel):
    phone_number: str  # TODO use sanitized type


def create_token(claim: PhoneNumberClaim, expiry: timedelta) -> Dict:
    """
    Get an encrypted token to claim a particular phone number.

    Usage:
    ```
    @router.get("/token", response_model=AuthToken, ...)
    def get_test_token():
        delta = datetime.timedelta(seconds=
            config.authentication.session.authentication_timeout)
        claim = PhoneNumberClaim(phone_number="123")
        return create_token(claim, delta)
    ````
    """
    config = Config.get()
    jwt_config = config.authentication.secret.jwt
    valid_until = datetime.utcnow() + expiry
    to_encode = {"phone_number": claim.phone_number, "exp": valid_until}
    token = jwt.encode(
        to_encode,
        jwt_config.symmetric_encryption_key,
        algorithm=jwt_config.allowed_algorithms[0],
    )
    return {"access_token": token, "token_type": "bearer"}


def get_confirmed_phone_number(
    token: Annotated[str, Depends(oauth2_scheme)]
) -> PhoneNumberClaim:
    """
    Ensure that a HTTP client has claims to a phone number.

    Usage:
    ```
    @router.get("/api-path", ...)
    def endpoint(token: typing.Annotated[PhoneNumberClaim,
                                         fastapi.Depends(get_confirmed_phone_number)]):
        pass
    """

    config = Config.get()
    jwt_config = config.authentication.secret.jwt
    try:
        claim = jwt.decode(
            token,
            jwt_config.symmetric_encryption_key,
            algorithms=jwt_config.allowed_algorithms[0],
            options={"require_exp": True},
        )
    except JWTError:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "invalid JWT token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if number := claim.get("phone_number"):
        return PhoneNumberClaim(phone_number=number)
    raise ValueError("JWT Token needs 'phone_number' field")
