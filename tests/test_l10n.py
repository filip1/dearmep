from typing import List, Tuple

import pytest

import callament.l10n as l10n


@pytest.mark.parametrize("hdr,res", [
    ("en-US,en;q=0.7,de;q=0.3", [("en-US", 1.0), ("en", 0.7), ("de", 0.3)]),
    ("en;q=0.7,en-US,de;q=0.3", [  # sorting should stay the same
        ("en-US", 1.0), ("en", 0.7), ("de", 0.3)
    ]),
    ("??;gonzo=5", [("??", 1.0)]),  # option which is not a q-value
    ("en", [("en", 1.0)]),
    ("en;q=9000", [("en", 1.0)]),  # invalid q-value
])
def test_parse_accept_language(hdr: str, res: List[Tuple[str, float]]):
    assert l10n.parse_accept_language(hdr) == res
