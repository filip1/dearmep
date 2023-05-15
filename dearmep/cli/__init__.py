from argparse import ArgumentParser, Namespace
from sys import exit, stderr
from typing import NamedTuple

from ..config import CMD_NAME
from . import db, dump, serve, version


class Context(NamedTuple):
    args: Namespace


def run():
    parser = ArgumentParser(
        prog=CMD_NAME.lower(),
    )
    subparsers = parser.add_subparsers(
        metavar="COMMAND",
    )
    version.add_parser(subparsers)
    db.add_parser(subparsers)
    dump.add_parser(subparsers)
    serve.add_parser(subparsers)
    args = parser.parse_args()

    if "func" not in args:
        parser.print_help(stderr)
        exit(127)

    args.func(Context(args))
