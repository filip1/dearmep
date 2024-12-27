# SPDX-FileCopyrightText: © 2023 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from __future__ import annotations

import logging
import re
from argparse import ArgumentParser, Namespace
from contextlib import contextmanager
from sys import argv, exit, stderr
from typing import TYPE_CHECKING

from dotenv import load_dotenv
from rich.console import Console
from rich.highlighter import NullHighlighter
from rich.logging import RichHandler
from rich.progress import Progress

from ..config import CMD_NAME
from ..progress import DummyTaskFactory, RichTaskFactory
from . import check, convert, db, dump, importing, run_alembic, serve, version


if TYPE_CHECKING:
    from collections.abc import Iterator


class Context:
    def __init__(
        self,
        *,
        args: Namespace,
        parser: ArgumentParser,
        raw_stdout: bool = False,
    ) -> None:
        self.args = args
        self.parser = parser
        # Let the Console run on stderr if we need stdout for raw data.
        self.console = Console(stderr=raw_stdout)
        self.raw_stdout = raw_stdout
        self.dummy_factory = DummyTaskFactory()

    def setup_logging(self, level: int = logging.INFO) -> None:
        def ignore_uninteresting(r: logging.LogRecord) -> bool:
            ratelimit_backoff = re.compile(
                r"^Backing off .+\(ratelimit.exception.RateLimitException"
            )
            if r.name == "backoff" and ratelimit_backoff.match(r.getMessage()):  # noqa: SIM103
                return False
            return True

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
    def task_factory(self) -> Iterator[RichTaskFactory]:
        progress = Progress(
            console=self.console,
            # This needs to be False for commands that dump actual data to
            # standard output, else Rich will mangle it.
            redirect_stdout=not self.raw_stdout,
        )
        with progress:
            yield RichTaskFactory(progress)


def help_if_no_subcommand(parser: ArgumentParser) -> None:
    """Convenience function that prints help and exits.

    Passed to command parsers; they can set this as the default if they require
    a subcommand. If none was supplied, this function prints the help.
    """

    def exit_help(ctx: Context) -> None:  # noqa: ARG001
        parser.print_help(stderr)
        exit(127)

    parser.set_defaults(func=exit_help)


def run() -> None:
    load_dotenv()
    parser = ArgumentParser(
        prog=CMD_NAME.lower(),
    )
    subparsers = parser.add_subparsers(
        metavar="COMMAND",
    )
    for module in (
        version,
        dump,
        serve,
        db,
        run_alembic,
        convert,
        importing,
        check,
    ):
        module.add_parser(
            subparsers,
            help_if_no_subcommand=help_if_no_subcommand,
        )
    help_if_no_subcommand(parser)

    # Special hack for the `alembic` subcommand: Inject a double dash if it's
    # used. This is because it needs to pass the rest of argv to Alembic
    # verbatim, but argparse can't ignore arguments that look like flags.
    # <https://github.com/python/cpython/issues/61252>
    if len(argv) > 1 and argv[1] == "alembic":
        argv.insert(2, "--")

    args = parser.parse_args()

    args.func(
        Context(
            args=args,
            parser=parser,
            # Commands can opt-in to have a raw stdout.
            raw_stdout=getattr(args, "raw_stdout", False),
        )
    )
