from __future__ import annotations
from argparse import ArgumentParser, Namespace
from contextlib import contextmanager
import logging
import re
from sys import exit, stderr

from rich.console import Console
from rich.highlighter import NullHighlighter
from rich.logging import RichHandler
from rich.progress import Progress

from . import convert, db, dump, importing, serve, version
from ..config import CMD_NAME
from ..progress import DummyTaskFactory, RichTaskFactory


class Context:
    def __init__(self, *, args: Namespace, raw_stdout: bool = False):
        self.args = args
        # Let the Console run on stderr if we need stdout for raw data.
        self.console = Console(stderr=raw_stdout)
        self.raw_stdout = raw_stdout
        self.dummy_factory = DummyTaskFactory()

    def setup_logging(self, level: int = logging.INFO):
        def ignore_uninteresting(r: logging.LogRecord) -> int:
            ratelimit_backoff = re.compile(
                r"^Backing off .+\(ratelimit.exception.RateLimitException")
            if r.name == "backoff" and ratelimit_backoff.match(r.getMessage()):
                return 0
            return 1

        handler = RichHandler(
            console=self.console,
            highlighter=NullHighlighter(),
        )
        handler.addFilter(ignore_uninteresting)
        logging.basicConfig(
            level=level,
            handlers=(handler,),
        )

    @contextmanager
    def task_factory(self):
        progress = Progress(
            console=self.console,
            # This needs to be False for commands that dump actual data to
            # standard output, else Rich will mangle it.
            redirect_stdout=not self.raw_stdout,
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
    for module in (version, dump, serve, db, convert, importing):
        module.add_parser(
            subparsers,
            help_if_no_subcommand=help_if_no_subcommand,
        )
    help_if_no_subcommand(parser)
    args = parser.parse_args()

    args.func(Context(
        args=args,
        # Commands can opt-in to have a raw stdout.
        raw_stdout=getattr(args, "raw_stdout", False),
    ))
