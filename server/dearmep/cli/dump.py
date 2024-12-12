# SPDX-FileCopyrightText: © 2023 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from __future__ import annotations

import json
import logging
import sys
from os import environ
from typing import TYPE_CHECKING, Callable, Optional

from pydantic import ValidationError


if TYPE_CHECKING:
    from argparse import ArgumentParser, _SubParsersAction

    from . import Context
from ..config import (
    APP_NAME,
    ENV_PREFIX,
    Config,
    Settings,
    included_file,
    is_config_missing,
)
from ..main import create_app


_logger = logging.getLogger(__name__)


def fake_config(patch: Optional[dict] = None) -> None:
    try:
        s = Settings()
    except ValidationError as e:
        if not is_config_missing(e):
            raise
        # Use the builtin config instead.
        environ[ENV_PREFIX + "CONFIG"] = str(
            included_file("example-config.yaml")
        )
        s = Settings()
    if patch:
        Config.set_patch(patch)
    Config.load_yaml_file(s.config_file)


def dump_included_file(name: str) -> None:
    print(included_file(name).read_text())  # noqa: T201


def dump_erd(ctx: Context) -> None:
    try:
        from eralchemy2 import render_er

        from ..database import get_metadata
    except ModuleNotFoundError:
        _logger.exception(
            f"eralchemy2 not found; have you installed {APP_NAME} with the "
            "[specs] extra?"
        )
        sys.exit(1)
    render_er(get_metadata(), ctx.args.outfile)


def dump_example_config(ctx: Context) -> None:  # noqa: ARG001
    dump_included_file("example-config.yaml")


def dump_log_config(ctx: Context) -> None:  # noqa: ARG001
    dump_included_file("logging.yaml")


def dump_openapi(ctx: Context) -> None:
    fake_config()
    app = create_app()
    print(json.dumps(app.openapi(), indent=None if ctx.args.compact else 2))  # noqa: T201


def add_parser(
    subparsers: _SubParsersAction,
    help_if_no_subcommand: Callable,
) -> None:
    parser: ArgumentParser = subparsers.add_parser(
        "dump",
        help="dump example files & specifications",
        description="Retrieve certain built-in example files or "
        "specifications.",
    )
    subsub = parser.add_subparsers(metavar="ITEM")

    erd = subsub.add_parser(
        "erd",
        help="output an entity relationship diagram (requires [specs] extra)",
        description="Output an entity relationship diagram from the schema.",
    )
    erd.add_argument(
        "outfile",
        help="output filename; format determined by suffix; all output "
        "formats supported by eralchemy2 are available, including .png, .svg, "
        ".er, .dot, .md (Mermaid)",
    )
    erd.set_defaults(func=dump_erd)

    example_config = subsub.add_parser(
        "example-config",
        help="example application config",
        description=f"Dump an example {APP_NAME} configuration to stdout. You "
        "can then use it as a basis for your setup.",
    )
    example_config.set_defaults(func=dump_example_config)

    log_config = subsub.add_parser(
        "log-config",
        help="default logging config",
        description=f"Dump {APP_NAME}'s default logging configuration to "
        "stdout.",
    )
    log_config.set_defaults(func=dump_log_config)

    openapi = subsub.add_parser(
        "openapi",
        help="OpenAPI spec",
        description=f"Dump the {APP_NAME} OpenAPI specification to stdout.",
    )
    openapi.set_defaults(func=dump_openapi)
    openapi_compact = openapi.add_mutually_exclusive_group()
    openapi_compact.add_argument(
        "--compact",
        help="use a compact JSON representation (default if stdout is not a "
        "terminal)",
        action="store_const",
        dest="compact",
        const=True,
    )
    openapi_compact.add_argument(
        "--no-compact",
        help="use a human-readable, indented JSON representation (default if "
        "stdout is a terminal)",
        action="store_const",
        dest="compact",
        const=False,
    )
    openapi.set_defaults(compact=not sys.stdout.isatty())

    help_if_no_subcommand(parser)
