from typing import List

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
])
def test_parse_accept_language(header: str, expected: List[str]):
    assert l10n.parse_accept_language(header) == expected
