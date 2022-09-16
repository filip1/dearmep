from typing import List, Literal, Optional, Union

import pytest

import callament.l10n as l10n


@pytest.mark.parametrize("header,expected", [
    ("en-US,en;q=0.7,de;q=0.3", ["en-US", "en", "de"]),
    ("en;q=0.7,en-US,de;q=0.3", [  # sorting should stay the same
        "en-US", "en", "de",
    ]),
    ("pt;gonzo=5", ["pt"]),  # option which is not a q-value
    ("en", ["en"]),
    ("pt;q=0.5,en;q=9000", ["en", "pt"]),  # invalid q-value equals 1.0
    ("", []),  # empty Accept-Language header
    ("  ", []),  # some spaces? still empty
    ("de, , en", ["de", "en"]),  # ignore empty blocks
])
def test_parse_accept_language(header: str, expected: List[str]):
    assert l10n.parse_accept_language(header) == expected


@pytest.mark.parametrize("prefs,available,fallback,expected", [
    (["de-de", "en"], ["de-DE-1996", "en-US"], None, "de-DE-1996"),
    (["de-de", "en-GB"], ["de-AT", "en-US"], "", ""),
    (["de-de", "en-GB", "*"], ["de-AT", "en-US"], None, "de-AT"),
    (["de-de", "en"], ["de-AT", "en-US"], "", "en-US"),
    (["de-de", "en", "*"], ["de-AT", "en-US"], None, "en-US"),
    (["de-de", "de", "en", "*"], ["de-AT", "de-DE", "en-US"], None, "de-DE"),
    (["de-de", "tlh"], ["de-AT", "de-DE", "en-US"], None, "de-DE"),
    (["de-de", "tlh"], ["de-AT", "en-US"], None, False),
])
def test_find_preferred_language(
    prefs: List[str],
    available: List[str],
    fallback: Optional[str],
    expected: Union[str, Literal[False]],
):
    if expected is False:  # parameter means "expect an exception"
        with pytest.raises(l10n.LanguageNotAvailableException):
            l10n.find_preferred_language(
                prefs=prefs,
                available=available,
                fallback=fallback,
            )
    else:
        assert l10n.find_preferred_language(
            prefs=prefs,
            available=available,
            fallback=fallback,
        ) == expected


def test_find_preferred_with_no_available_languages():
    with pytest.raises(ValueError):
        l10n.find_preferred_language(prefs=["de-DE", "*"], available=[])
