from __future__ import annotations
from argparse import ArgumentParser, Namespace
from sys import exit, stderr
from typing import NamedTuple

from ..config import CMD_NAME
from . import db, dump, serve, version


class Context(NamedTuple):
    args: Namespace


def help_if_no_subcommand(parser: ArgumentParser):
    def exit_help(ctx: Context):
        parser.print_help(stderr)
        exit(127)
    parser.set_defaults(func=exit_help)


def run():
    parser = ArgumentParser(
        prog=CMD_NAME.lower(),
    )
    subparsers = parser.add_subparsers(
        metavar="COMMAND",
    )
    for cmd in (version, db, dump, serve):
        cmd.add_parser(
            subparsers,
            help_if_no_subcommand=help_if_no_subcommand,
        )
    args = parser.parse_args()

    if "func" not in args:
        parser.print_help(stderr)
        exit(127)

    args.func(Context(args))
