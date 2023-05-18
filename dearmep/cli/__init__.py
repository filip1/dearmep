from __future__ import annotations
from argparse import ArgumentParser, Namespace
from contextlib import contextmanager
from sys import exit, stderr

from rich.console import Console
from rich.progress import Progress

from . import convert, db, dump, serve, version
from ..config import CMD_NAME
from ..progress import RichTaskFactory


class Context:
    def __init__(self, *, args: Namespace):
        self.args = args
        self.console = Console(stderr=True)

    @contextmanager
    def task_factory(self, redirect_stdout: bool = False):
        progress = Progress(
            console=self.console,
            # This needs to be False for commands that dump actual data to
            # standard output, else Rich will mangle it.
            redirect_stdout=redirect_stdout,
        )
        with progress:
            yield RichTaskFactory(progress)


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
    for module in (version, dump, serve, db, convert):
        module.add_parser(
            subparsers,
            help_if_no_subcommand=help_if_no_subcommand,
        )
    args = parser.parse_args()

    if "func" not in args:
        parser.print_help(stderr)
        exit(127)

    args.func(Context(args=args))
