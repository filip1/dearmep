# SPDX-FileCopyrightText: © 2023 iameru
#
# SPDX-License-Identifier: AGPL-3.0-or-later

import logging
from random import choice

import httpx

from ...config import Language
from .models import Number


_logger = logging.getLogger(__name__)


def choose_from_number(
    user_number_prefix: str,
    user_language: Language,
    phone_numbers: list[Number],
) -> Number:
    """
    Returns a phonenumber we use to call the user. Preferably from the same
    country as the users number. In case a local country number does not exist,
    it falls back on the users language. In case there is no match it returns
    any international number.
    """
    number_prefix = [
        n
        for n in phone_numbers
        if n.number.startswith(f"+{user_number_prefix}") == user_number_prefix
    ]
    if number_prefix:
        return choice(number_prefix)  # noqa: S311

    # we fall back on language as the closest approximation to the users
    # country for now
    lang_numbers = [n for n in phone_numbers if n.country == user_language]
    if lang_numbers:
        return choice(lang_numbers)  # noqa: S311

    return choice(phone_numbers)  # noqa: S311


def get_numbers(
    phone_numbers: list[Number], auth: tuple[str, str]
) -> list[Number]:
    """
    Fetches all available numbers of an account at 46elks.
    """

    response = httpx.get(
        url="https://api.46elks.com/a1/numbers", timeout=10, auth=auth
    )
    if response.status_code != 200:  # noqa: PLR2004
        raise Exception(  # noqa: TRY002
            "Could not fetch numbers from 46elks. "
            f"Their http status: {response.status_code}"
        )

    phone_numbers.clear()
    phone_numbers.extend(
        [Number.parse_obj(number) for number in response.json().get("data")]
    )
    _logger.info(
        "Currently available 46elks phone numbers: "
        f"{[number.number for number in phone_numbers]}",
    )

    return phone_numbers
