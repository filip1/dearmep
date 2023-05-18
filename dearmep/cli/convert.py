from __future__ import annotations
from argparse import _SubParsersAction, ArgumentParser
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from . import Context
from ..convert import csv, json
from ..progress import FlexiReader


def run_csv2json(ctx: Context):
    with ctx.task_factory() as tf:
        for jsonstr in json.obj2json(
            csv.csv2dict(ctx.args.input, tf),
            tf,
            compact=ctx.args.compact,
            ascii_only=not ctx.args.non_ascii,
        ):
            print(jsonstr)


def add_parser(subparsers: _SubParsersAction, help_if_no_subcommand, **kwargs):
    parser: ArgumentParser = subparsers.add_parser(
        "convert",
        help="convert data formats into others",
        description="Convert several data formats into others.",
    )
    subsub = parser.add_subparsers(metavar="CONVERTER")

    csv2json = subsub.add_parser(
        "csv2json",
        help="convert CSV to JSON",
        description="Convert CSV data into JSON objects on standard output.",
    )
    FlexiReader.add_as_argument(
        csv2json,
        # As requested by the csv module, don't mangle newlines.
        constructor_args={"reconfigure": {"newline": ""}},
    )
    csv2json.add_argument(
        "--compact",
        action="store_true",
        help="remove unnecessary whitespace",
    )
    csv2json.add_argument(
        "--non-ascii",
        action="store_true",
        help="don't escape non-ASCII characters in the JSON output",
    )
    csv2json.set_defaults(func=run_csv2json, raw_stdout=True)

    help_if_no_subcommand(parser)
