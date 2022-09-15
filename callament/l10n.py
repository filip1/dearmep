import re
from typing import List, Tuple


Q_VALUE_RE = r"^(?:0(?:\.[0-9]{0,3})?|1(?:\.0{0,3})?)$"


def parse_accept_language(spec: str) -> List[Tuple[str, float]]:
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

    pairs.sort(reverse=True, key=lambda pair: pair[1])
    return pairs
