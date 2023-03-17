#!/usr/bin/env python3

from datetime import date
import json
from typing import Any, Dict, List, cast

from countryguess import guess_country  # type: ignore

from ....models import Person, PersonContact
from ...csv import persons_to_csv
from ...util import InputFile, Progress, decompressed_lz_stream, \
    indeterminate_task, progress


TODAY = date.today()
CONTACT_MAP = {
    "Facebook": "facebook",
    "Homepage": "web",
    "Instagram": "instagram",
    "Mail": "email",
    "Twitter": "twitter",
}


def convert_person(raw_mep: Dict[str, Any]) -> Person:
    contact = []
    for pt_key, dmep_key in CONTACT_MAP.items():
        for addr in raw_mep.get(pt_key, []):
            contact.append(PersonContact(
                kind=dmep_key,
                address=addr,
            ))

    group = next((
        group["groupid"]
        for group in cast(List[Dict[str, str]], raw_mep.get("Groups", []))
        if is_current(group)
    ), None)
    constituency = next((
        constituency
        for constituency in cast(
            List[Dict[str, str]], raw_mep.get("Constituencies", []))
        if is_current(constituency)
    ), None)

    return Person(
        id=raw_mep["UserID"],
        name=raw_mep["Name"]["full"],
        country=guess_country(constituency["country"], attribute="iso2")
        if constituency else None,
        group=group,
        party=constituency["party"] if constituency else None,
        contact=contact,
    )


def is_current(item: dict) -> bool:
    start = parse_date(item["start"])
    end = parse_date(item["end"])
    return start <= TODAY <= end


def parse_date(datestr: str) -> date:
    return date.fromisoformat(datestr[:10])


def load_json(
    file: InputFile,
    progress: Progress,
    *,
    only_active: bool = True,
) -> List[Person]:
    with decompressed_lz_stream(file, progress=progress) as stream:
        json_bytes = b"".join(stream)
    with indeterminate_task(progress, "Parsing JSON"):
        raw_meps = json.loads(json_bytes)

    to_model = progress.add_task(
        "Converting to DearMEP format", total=len(raw_meps))
    meps = []
    for raw_mep in raw_meps:
        if not only_active or raw_mep["active"] is True:
            meps.append(convert_person(raw_mep))
        progress.advance(to_model)

    return meps


def cli():
    from argparse import ArgumentParser

    parser = ArgumentParser(
        description="convert ParlTrack's MEP dumps",
    )

    parser.add_argument(
        "inputfile",
        help="path to a .json.lz file containing the dump, or '-' for stdin",
    )

    parser.add_argument(
        "--to-csv", metavar="filename",
        nargs="?", const="-",
        help="convert the dump to CSV format, write to a file (or stdout)",
    )

    args = parser.parse_args()
    with progress() as p:
        meps = load_json(args.inputfile, p)
        if args.to_csv is not None:
            persons_to_csv(meps, args.to_csv, progress=p)


if __name__ == "__main__":
    from .mep import cli as run_cli
    run_cli()
