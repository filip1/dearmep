from __future__ import annotations
from argparse import _SubParsersAction, ArgumentParser
import logging
from typing import TYPE_CHECKING, Callable

if TYPE_CHECKING:
    from . import Context
from ..config import APP_NAME, CMD_NAME
from ..convert import dump
from ..convert.europarl import portrait, rollcallvote
from ..convert.parltrack import mep
from ..convert.tabular import CSVStreamTabular, Tabular
from ..http_client import DEFAULT_MASS_DOWNLOAD_JOBS
from ..progress import FlexiBytesReader


MEP_PORTRAIT_FILE_PATTERN = "{id}.jpg"


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


def europarl_portraits(ctx: Context):
    logging.basicConfig(level=logging.DEBUG)
    ids = set(ctx.args.ID)
    with ctx.task_factory() as tf:
        task = tf.create_task("downloading portraits", total=len(ids))
        portrait.download_portraits(
            ids, ctx.args.filename_template, ctx.args.jobs,
            skip_existing=ctx.args.existing == "skip",
            overwrite=ctx.args.existing == "overwrite",
            ignore_not_found=ctx.args.ignore_not_found,
            task=task,
        )


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

    mep_portraits = subsub.add_parser(
        "europarl.portraits",
        help="portrait images of Members of the European Parliament",
        description="Download portrait images of Members of the European "
        "Parliament from the Parliament's server.",
    )
    mep_portraits.add_argument(
        "-f", "--filename-template", metavar="TEMPLATE",
        default=MEP_PORTRAIT_FILE_PATTERN,
        help="Python .format() string template to determine target filename, "
        "{id} will be replaced by the MEP's ID (default: "
        f"{MEP_PORTRAIT_FILE_PATTERN})",
    )
    mep_portraits.add_argument(
        "-i", "--ignore-not-found",
        action="store_true",
        help="if there is no portrait for a given ID, silently ignore the "
        "error (instead of aborting the download process)",
    )
    mep_portraits.add_argument(
        "-j", "--jobs", metavar="N",
        default=DEFAULT_MASS_DOWNLOAD_JOBS, type=int,
        help="the number of parallel download jobs to run (default: "
        f"{DEFAULT_MASS_DOWNLOAD_JOBS})",
    )
    mep_portraits.add_argument(
        "-e", "--existing", metavar="ACTION",
        choices=("stop", "skip", "overwrite"), default="stop",
        help="what to do if the target file already exists: 'stop' the whole "
        "download process (default), 'skip' downloading this file (keeping "
        "the existing file as is), or 'overwrite' (download again)",
    )
    mep_portraits.add_argument(
        "ID",
        help="the numerical MEP ID to download portraits for",
        nargs="+", type=int,
    )
    mep_portraits.set_defaults(func=europarl_portraits)

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
        f"that can then be imported (e.g. using `{CMD_NAME} import "
        "destinations`) as the list of Destinations to contact.",
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
