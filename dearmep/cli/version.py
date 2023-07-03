from __future__ import annotations
from argparse import _SubParsersAction, ArgumentParser
from importlib import metadata
import sys
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from . import Context
from .. import __version__
from ..config import APP_NAME


ADDITIONAL_PACKAGES = (
    "FastAPI",
    "Pydantic",
    "python-geoacumen",
    "countryguess",
)


def run(ctx: Context):
    versions = {
        APP_NAME: __version__,
        "Python": sys.version.replace("\n", " "),
    }
    for pkg in ADDITIONAL_PACKAGES:
        versions[pkg] = metadata.version(pkg)
    longest_pkg_name_len = max(len(pkg_name) for pkg_name in versions)
    for component, version in versions.items():
        print(f"{component.ljust(longest_pkg_name_len)} {version}")


def add_parser(subparsers: _SubParsersAction, **kwargs):
    parser: ArgumentParser = subparsers.add_parser(
        "version",
        help="show version information",
        description=f"Shows {APP_NAME}'s version, as well as those of some "
        "key dependencies.",
    )
    parser.set_defaults(func=run)
