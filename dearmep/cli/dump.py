from argparse import _SubParsersAction, ArgumentParser
import json
from os import environ
from pathlib import Path
import sys
from typing import Dict, Optional

from pydantic import ValidationError

from ..config import APP_NAME, ENV_PREFIX, Config, Settings, is_config_missing
from ..main import create_app


def fake_config(patch: Optional[Dict] = None):
    try:
        s = Settings()
    except ValidationError as e:
        if not is_config_missing(e):
            raise
        # Use the builtin config instead.
        environ[ENV_PREFIX+"CONFIG"] = str(
            included_file("example-config.yaml"))
        s = Settings()
    if patch:
        Config.set_patch(patch)
    Config.load_yaml_file(s.config_file)


def included_file(name: str) -> Path:
    return Path(Path(__file__).parent.parent, name)


def dump_included_file(name: str):
    print(included_file(name).read_text())


def dump_example_config(args):
    dump_included_file("example-config.yaml")


def dump_log_config(args):
    dump_included_file("logging.yaml")


def dump_openapi(args):
    # We don't need the Geo DB to dump an OpenAPI spec.
    fake_config({"l10n": {"geo_mmdb": None}})
    app = create_app()
    print(json.dumps(app.openapi(), indent=None if args.compact else 2))


def add_parser(subparsers: _SubParsersAction):
    parser: ArgumentParser = subparsers.add_parser(
        "dump",
        help="dump example files & specifications",
        description="Retrieve certain built-in example files or "
        "specifications.",
    )
    subsub = parser.add_subparsers(metavar="ITEM")

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
        action="store_const", dest="compact", const=True,
    )
    openapi_compact.add_argument(
        "--no-compact",
        help="use a human-readable, indented JSON representation (default if "
        "stdout is a terminal)",
        action="store_const", dest="compact", const=False,
    )
    openapi.set_defaults(compact=not sys.stdout.isatty())

    parser.set_defaults(func=lambda args: parser.error("no item selected"))
