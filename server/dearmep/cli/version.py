# SPDX-FileCopyrightText: © 2023 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from __future__ import annotations

import sys
from importlib import metadata
from typing import TYPE_CHECKING, Callable


if TYPE_CHECKING:
    from argparse import ArgumentParser, _SubParsersAction

    from . import Context
from .. import __version__
from ..config import APP_NAME


ADDITIONAL_PACKAGES = (
    "FastAPI",
    "Pydantic",
    "Pillow",
    "python-geoacumen",
    "countryguess",
)


def run(ctx: Context) -> None:  # noqa: ARG001
    versions = {
        APP_NAME: __version__,
        "Python": sys.version.replace("\n", " "),
    }
    for pkg in ADDITIONAL_PACKAGES:
        versions[pkg] = metadata.version(pkg)
    longest_pkg_name_len = max(len(pkg_name) for pkg_name in versions)
    for component, version in versions.items():
        print(f"{component.ljust(longest_pkg_name_len)} {version}")  # noqa: T201


def add_parser(
    subparsers: _SubParsersAction,
    help_if_no_subcommand: Callable,  # noqa: ARG001
) -> None:
    parser: ArgumentParser = subparsers.add_parser(
        "version",
        help="show version information",
        description=f"Shows {APP_NAME}'s version, as well as those of some "
        "key dependencies.",
    )
    parser.set_defaults(func=run)
