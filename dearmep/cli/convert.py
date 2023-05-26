from __future__ import annotations
from argparse import _SubParsersAction, ArgumentParser
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from . import Context
from ..convert import csv, json
from ..convert.europarl import rollcallvote
from ..progress import FlexiBytesReader, FlexiStrReader


def run_csv2json(ctx: Context):
    with ctx.task_factory() as tf:
        for jsonstr in json.obj2json(
            csv.csv2dict(ctx.args.input, tf),
            ctx.dummy_factory,
            compact=ctx.args.compact,
            ascii_only=not ctx.args.non_ascii,
        ):
            print(jsonstr)


def rollcallvote_topics(ctx: Context):
    with ctx.task_factory() as tf:
        table = rollcallvote.list_topics(ctx.args.input, tf)
    ctx.console.print(table.to_rich_table())


def rollcallvote_votes(ctx: Context):
    with ctx.task_factory() as tf:
        table = rollcallvote.list_votes(ctx.args.input, tf, ctx.args.topic)
    ctx.console.print(table.to_rich_table())


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
    FlexiStrReader.add_as_argument(
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

    rcv = subsub.add_parser(
        "europarl.rollcallvote",
        help="European Parliament Roll Call Vote",
    )
    rcv_sub = rcv.add_subparsers(metavar="RCV_ACTION")

    rcv_topics = rcv_sub.add_parser(
        "topics",
        help="list all voting topics in the input file",
    )
    FlexiBytesReader.add_as_argument(rcv_topics)
    rcv_topics.set_defaults(func=rollcallvote_topics, raw_stdout=True)

    rcv_votes = rcv_sub.add_parser(
        "votes",
        help="list all votes for/against a given topic",
    )
    rcv_votes.add_argument(
        "topic",
        help="ID of the topic to return the votes for",
    )
    FlexiBytesReader.add_as_argument(rcv_votes)
    rcv_votes.set_defaults(func=rollcallvote_votes, raw_stdout=True)

    help_if_no_subcommand(rcv)

    help_if_no_subcommand(parser)
