from argparse import _SubParsersAction, ArgumentParser
from pathlib import Path

from ..config import APP_NAME


def dump_included_file(name: str):
    file = Path(Path(__file__).parent.parent, name)
    print(file.read_text())


def dump_log_config():
    dump_included_file("logging.yaml")


def add_parser(subparsers: _SubParsersAction):
    parser: ArgumentParser = subparsers.add_parser(
        "dump",
        help="dump example files & specifications",
        description="Retrieve certain built-in example files or "
        "specifications.",
    )
    subsub = parser.add_subparsers(metavar="ITEM")

    log_config = subsub.add_parser(
        "log-config",
        help="default logging config",
        description=f"Dump {APP_NAME}'s default logging configuration to "
        "stdout.",
    )
    log_config.set_defaults(func=dump_log_config)

    parser.set_defaults(func=lambda: parser.error("no item selected"))
