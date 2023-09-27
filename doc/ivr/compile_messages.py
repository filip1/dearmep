#!/usr/bin/env python3

import csv
from pathlib import Path
import re
from typing import Dict, Optional, Sequence

import yaml


POINT_ID = re.compile(r"^talkingPoints\.points\.([0-9]+)\.")
POINT_PREFIX = "talkingPoints.points."


csv.register_dialect("fully_quoted", quoting=csv.QUOTE_NONNUMERIC)


def load_messages(path: Path):
    with path.open(newline="") as stream:
        reader = csv.DictReader(stream)
        rows = {
            row["ID"]: {
                col: "" if val is None else val
                for col, val in row.items()
                if col != "ID"
            }
            for row in reader
        }
    langs = tuple(
        lang
        for lang in next(iter(rows.values())).keys()
        if lang != "Comment"
    )
    return rows, langs


def load_arguments(path: Path, langs: Sequence[str]):
    def point(strings: Dict[str, Dict[str, str]], num: int, lang: str):
        pre = f"{POINT_PREFIX}{num}."
        return (
            strings[f"{pre}title"][lang] +
            ": " +
            strings[f"{pre}body"][lang]
        )

    with path.open() as stream:
        yaml_dict = yaml.load(stream, yaml.Loader)
    strings = yaml_dict["l10n"]["frontend_strings"]
    # Collect talking point IDs.
    ids = set(
        int(match[1])
        for key in strings
        if (match := POINT_ID.match(key))
    )
    args = {
        f"argument_{num}": {
            lang: point(strings, num, lang)
            for lang in langs
        }
        for num in ids
    }
    return args


def write_csv(path: Path, rows):
    fields = ("ID",) + tuple(next(iter(rows.values())).keys())
    with path.open("w", newline="") as stream:
        writer = csv.DictWriter(stream, fields, dialect="fully_quoted")
        writer.writeheader()
        for id, vals in rows.items():
            writer.writerow({ "ID": id, **vals })


def run(repo_root: Optional[Path] = None):
    if not repo_root:
        repo_root = Path(__file__).parent.parent.parent
    ivr_dir = repo_root / "doc" / "ivr"
    dearmep_dir = repo_root / "server" / "dearmep"

    msgs, langs = load_messages(ivr_dir / "messages.csv")
    args = load_arguments(dearmep_dir / "example-config.yaml", langs)

    combined = { **msgs, **args }

    write_csv(ivr_dir / "combined.csv", combined)


if __name__ == "__main__":
    run()
