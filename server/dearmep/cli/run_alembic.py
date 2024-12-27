# SPDX-FileCopyrightText: © 2024 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from __future__ import annotations

import logging
from os import environ
from pathlib import Path
from typing import TYPE_CHECKING, Callable

import alembic.config


if TYPE_CHECKING:
    from argparse import ArgumentParser, _SubParsersAction

    from . import Context


_logger = logging.getLogger(__name__)


CONFIG_VAR = "ALEMBIC_CONFIG"


def run(ctx: Context) -> None:
    alembic_config = Path(__file__).parent.parent / "migrations/alembic.ini"
    environ[CONFIG_VAR] = str(alembic_config)
    alembic.config.main(prog=f"{ctx.parser.prog} alembic", argv=ctx.args.args)


def add_parser(
    subparsers: _SubParsersAction,
    help_if_no_subcommand: Callable,  # noqa: ARG001
) -> None:
    parser: ArgumentParser = subparsers.add_parser(
        "alembic",
        help="invoke pre-configured Alembic to execute database migrations",
        add_help=False,  # don't hijack Alembic's own `-h`
    )
    parser.add_argument("args", nargs="*")
    parser.set_defaults(func=run)
