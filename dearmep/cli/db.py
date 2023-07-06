from __future__ import annotations
from argparse import _SubParsersAction, ArgumentParser
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from . import Context
from ..config import APP_NAME, Config
from ..database import create_db


def cmd_init(ctx: Context):
    Config.load()
    create_db()


def add_parser(subparsers: _SubParsersAction, help_if_no_subcommand, **kwargs):
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

    help_if_no_subcommand(parser)
