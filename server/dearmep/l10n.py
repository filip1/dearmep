# SPDX-FileCopyrightText: © 2022 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

import logging
import operator
import re
from collections.abc import Sequence
from pathlib import Path
from typing import Optional, Union

import maxminddb
from maxminddb import errors as mmdberrors
from sqlmodel import Session

from .database import query
from .models import LocationDetection


_logger = logging.getLogger(__name__)


Q_VALUE_RE = r"^(?:0(?:\.[0-9]{0,3})?|1(?:\.0{0,3})?)$"


class LanguageNotAvailableError(Exception):
    pass


def parse_accept_language(spec: str) -> list[str]:
    """Convert the value of an Accept-Language header to an ordered list."""
    # This will become the resulting list.
    pairs = []

    # First of all, split the user's prefence list by commas.
    prefs = spec.split(",")
    for pref in prefs:
        # There can be an optional "quality value" after the language,
        # delimited by a semicolon and prefixed with `q=`.
        split = pref.strip().split(";")
        # The base language is everything before the first semicolon.
        lang = split[0].strip()
        # If the base language is empty (usually because the whole input string
        # is empty), it makes no sense to use it.
        if not lang:
            continue

        # To be future-proof, iterate over the other parts and look for one
        # starting with `q=`. Default to 1.0 if there is none.
        q = 1.0
        for option in split[1:]:
            k, v = option.strip().split("=")
            if k.strip() == "q":
                v = v.strip()
                if re.match(Q_VALUE_RE, v):
                    q = float(v)

        pairs.append((lang, q))

    pairs.sort(reverse=True, key=operator.itemgetter(1))
    # Cut off the q-value, the caller is probably not interested in it.
    return [pair[0] for pair in pairs]


def find_preferred_language(
    *,
    prefs: list[str],
    available: Sequence[str],
    fallback: Optional[str] = None,
) -> str:
    """From a list of available languages, select the one most preferred.

    The preferences list should be ordered with the most preferred language
    first, just like `parse_accept_language` returns it.

    The matching is performed as described under "Basic Filtering" (section
    3.3.1) in RFC 4647: Either the preference matches an available language
    exactly, or the preference is a prefix of an available language (e.g.
    `de-de` would match `de-DE-1996`). Matching is case insensitive.

    If no preferred language is available, either return the fallback (if
    specified), or raise a LanguageNotAvailableError. However, if there is an
    asterisk `*` in the preferences, the first item in `available` will be
    selected instead of the fallback or raising an exception.
    """
    if not len(available):
        raise ValueError("there should be at least one available language")

    for preference in [pref.lower() for pref in prefs]:
        # Look for an exact match.
        for av in available:
            if preference == av.lower():
                return av

        # If there was no exact match, try a prefix match.
        prefix = f"{preference}-"
        for av in available:
            if av.lower().startswith(prefix):
                return av

    # No available language matched. If the wildcard is accepted, use the first
    # available language.
    if "*" in prefs:
        return available[0]

    # If there is a fallback, return that. Else, raise an exception.
    if fallback is not None:
        return fallback

    raise LanguageNotAvailableError(
        "none of the preferred languages are available"
    )


def get_country(
    session: Session,
    db_file: Optional[Union[str, Path]],
    ip_addr: str,
) -> LocationDetection:
    available_countries = query.get_available_countries(session)

    if db_file is None:
        # Use the bundled one.
        import geoacumen  # type: ignore

        db_file = geoacumen.db_path

    country = res = None

    try:
        with maxminddb.open_database(str(db_file)) as reader:
            res = reader.get(ip_addr)
            if isinstance(res, dict):
                country = res.get("country", None)
                if isinstance(country, dict):
                    country = country.get("iso_code", None)
    except (FileNotFoundError, ValueError, mmdberrors.InvalidDatabaseError):
        _logger.exception("could not determine country")

    if isinstance(country, str) and 1 < len(country) < 4:  # noqa: PLR2004
        country = country.upper()
    else:
        # Doesn't look right, country should be an ISO-639 code.
        country = None

    return LocationDetection(
        available=available_countries,
        country=country,
        recommended=country if country in available_countries else None,
        db_result=res,
        ip_address=ip_addr,
    )
