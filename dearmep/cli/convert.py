from __future__ import annotations
from argparse import _SubParsersAction, ArgumentParser
from typing import TYPE_CHECKING, Callable

if TYPE_CHECKING:
    from . import Context
from ..config import APP_NAME
from ..convert import dump
from ..convert.europarl import rollcallvote
from ..convert.parltrack import mep
from ..convert.tabular import CSVStreamTabular, Tabular
from ..progress import FlexiBytesReader


def tabular_class(ctx: Context):
    """Return the correct Tabular subclass depending on the output format."""
    format = ctx.args.output_format
    if format == "csv":
        return CSVStreamTabular
    else:
        return Tabular


def parltrack_meps(ctx: Context):
    with ctx.task_factory() as tf:
        for output in dump.dump_iter_json(mep.convert_meps(
            ctx.args.input,
            tf,
            include_inactive=ctx.args.include_inactive,
            lz_compressed=ctx.args.lz,
        )):
            print(output)


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
        "--topic", "-t",
        help="ID of the topic to return the votes for",
        required=True,
    )
    rcv_template(rcv_votes, rollcallvote_votes)

    help_if_no_subcommand(rcv)

    meps = subsub.add_parser(
        "parltrack.meps",
        help="ParlTrack MEP list",
        description="Convert one of ParlTrack's \"MEPs\" dumps (see "
        f"<https://parltrack.org/dumps>) into {APP_NAME} Destination JSON "
        "that can then be imported as the list of Destinations to contact."
    )
    FlexiBytesReader.add_as_argument(meps)
    meps_lz = meps.add_mutually_exclusive_group()
    meps_lz.add_argument(
        "--lz", action="store_true",
        help="assume the input to be lz compressed, just as you would "
        "download it from the ParlTrack website (default)",
    )
    meps_lz.add_argument(
        "--no-lz", dest="lz", action="store_false",
        help="assume the input to be uncompressed JSON",
    )
    meps.add_argument(
        "--include-inactive", action="store_true",
        help='include MEPs that are marked in the input as being "inactive"',
    )
    meps.set_defaults(func=parltrack_meps, raw_stdout=True, lz=True)

    help_if_no_subcommand(parser)
