from argparse import _SubParsersAction, ArgumentParser

from ..config import APP_NAME, Config
from ..database import create_db


def cmd_init(args):
    Config.load()
    create_db()


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

    parser.set_defaults(func=lambda args: parser.error("no command selected"))
