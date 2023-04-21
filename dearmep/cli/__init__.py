from argparse import ArgumentParser
from sys import exit, stderr

from ..config import APP_NAME
from . import dump, version


def run():
    parser = ArgumentParser(
        prog=APP_NAME.lower(),
    )
    subparsers = parser.add_subparsers(
        metavar="COMMAND",
    )
    version.add_parser(subparsers)
    dump.add_parser(subparsers)
    args = parser.parse_args()

    if "func" not in args:
        parser.print_help(stderr)
        exit(127)

    args.func(args)
