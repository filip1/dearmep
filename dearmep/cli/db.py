from argparse import _SubParsersAction, ArgumentParser
import logging
import sys

from ..config import APP_NAME, Config
from ..database import create_db, get_metadata


_logger = logging.getLogger(__name__)


def cmd_init(args):
    Config.load()
    create_db()


def cmd_erd(args):
    try:
        from eralchemy2 import render_er
    except ModuleNotFoundError:
        _logger.exception(
            f"eralchemy2 not found; have you installed {APP_NAME} with the "
            "[specs] extra?"
        )
        sys.exit(1)
    render_er(get_metadata(), args.outfile)


def add_parser(subparsers: _SubParsersAction):
    parser: ArgumentParser = subparsers.add_parser(
        "db",
        help="manage the database",
        description=f"Manage the {APP_NAME} database and its contents.",
    )
    subsub = parser.add_subparsers(metavar="COMMAND")

    init = subsub.add_parser(
        "init",
        help="initialize the database from scratch",
        description="Create a new, empty database.",
    )
    init.set_defaults(func=cmd_init)

    erd = subsub.add_parser(
        "erd",
        help="output an entity relationship diagram",
        description="Output an entity relationship diagram from the schema.",
    )
    erd.add_argument(
        "outfile",
        help="output filename; format determined by suffix; all output "
        "formats supported by eralchemy2 are available, including .png, .svg, "
        ".er, .dot, .md (Mermaid)",
    )
    erd.set_defaults(func=cmd_erd)

    parser.set_defaults(func=lambda args: parser.error("no command selected"))
