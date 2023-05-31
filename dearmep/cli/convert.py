from __future__ import annotations
from argparse import _SubParsersAction, ArgumentParser
from typing import TYPE_CHECKING, Callable

if TYPE_CHECKING:
    from . import Context
from ..convert import csv, json
from ..convert.europarl import rollcallvote
from ..convert.tabular import CSVStreamTabular, Tabular
from ..progress import FlexiBytesReader, FlexiStrReader


def tabular_class(ctx: Context):
    """Return the correct Tabular subclass depending on the output format."""
    format = ctx.args.output_format
    if format == "csv":
        return CSVStreamTabular
    else:
        return Tabular


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
        table = rollcallvote.list_topics(
            ctx.args.input,
            tf,
            tabular_class(ctx),
        )
    table.print_to_console(ctx.console)


def rollcallvote_votes(ctx: Context):
    with ctx.task_factory() as tf:
        table = rollcallvote.list_votes(
            ctx.args.input,
            tf,
            tabular_class(ctx),
            ctx.args.topic,
        )
    table.print_to_console(ctx.console)


def add_parser(subparsers: _SubParsersAction, help_if_no_subcommand, **kwargs):
    def rcv_template(parser: ArgumentParser, func: Callable):
        FlexiBytesReader.add_as_argument(parser)
        parser.add_argument(
            "-f", "--output-format",
            metavar="FORMAT", choices=("csv", "table"),
            default="table",
            help="output data format",
        )
        parser.set_defaults(func=func, raw_stdout=True)

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
    rcv_template(rcv_topics, rollcallvote_topics)

    rcv_votes = rcv_sub.add_parser(
        "votes",
        help="list all votes for/against a given topic",
    )
    rcv_votes.add_argument(
        "topic",
        help="ID of the topic to return the votes for",
    )
    rcv_template(rcv_votes, rollcallvote_votes)

    help_if_no_subcommand(rcv)

    help_if_no_subcommand(parser)
