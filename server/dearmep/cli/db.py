# SPDX-FileCopyrightText: © 2023 Tim Weber
# SPDX-FileCopyrightText: © 2023 iameru
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from __future__ import annotations

from mimetypes import guess_type
from pathlib import Path
from typing import TYPE_CHECKING, Callable

from sqlalchemy.exc import IntegrityError


if TYPE_CHECKING:
    from argparse import ArgumentParser, _SubParsersAction

    from . import Context
from ..config import APP_NAME, Config
from ..database import lint, query
from ..database.connection import get_session
from ..database.models import Blob


def cmd_lint(ctx: Context) -> None:  # noqa: ARG001
    Config.load()
    with get_session() as session:
        lint.print_all_issues(session)


def cmd_store_blob(ctx: Context) -> None:
    Config.load()
    if ctx.args.name and len(ctx.args.files) > 1:
        raise ValueError("--name can only be used with a single input file")
    for file in ctx.args.files:
        name = ctx.args.name or file.name
        mime = ctx.args.mime or guess_type(file, strict=False)[0]
        if not mime:
            raise ValueError(f"could not guess MIME type for {file}")
        blob = Blob(
            type=ctx.args.type,
            mime_type=mime,
            name=name,
            description=ctx.args.description,
            data=file.read_bytes(),
        )
        with get_session() as session:
            if ctx.args.overwrite:
                try:
                    oldblob = query.get_blob_by_name(session, name)
                    session.delete(oldblob)
                    session.flush()
                except query.NotFound:
                    pass
            session.add(blob)
            try:
                session.commit()
            except IntegrityError:
                raise ValueError(f"blob named {name} already exists") from None
            print(blob.id)  # noqa: T201


def add_parser(
    subparsers: _SubParsersAction,
    help_if_no_subcommand: Callable,
) -> None:
    parser: ArgumentParser = subparsers.add_parser(
        "db",
        help="manage the database",
        description=f"Manage the {APP_NAME} database and its contents.",
    )
    subsub = parser.add_subparsers(metavar="COMMAND")

    lint = subsub.add_parser(
        "lint",
        help="check database contents for issues",
        description="Check the database for things that don't look right.",
    )
    lint.set_defaults(func=cmd_lint)

    store_blob = subsub.add_parser(
        "store-blob",
        help="store a blob (i.e., file asset) in the database",
        description="Store one or more static files in the database.",
    )
    store_blob.add_argument(
        "--type",
        required=True,
        help="the type (category) of the blob, e.g. `logo`, `name_audio` etc.",
    )
    store_blob.add_argument(
        "--mime",
        metavar="MIMETYPE",
        help="the MIME type of the blob (default: guess from extension)",
    )
    store_blob.add_argument(
        "--name",
        metavar="NAME",
        help="the file name to use when storing (default: keep original); may "
        "not be set when supplying multiple files as arguments",
    )
    store_blob.add_argument(
        "--description",
        metavar="TEXT",
        help="a helpful description to add to the blob",
    )
    store_blob.add_argument(
        "--overwrite",
        action="store_true",
        help="if there already is a blob with that name, overwrite it",
    )
    store_blob.add_argument(
        "files",
        metavar="FILE",
        type=Path,
        nargs="+",
        help="name of the local file to read and store",
    )
    store_blob.set_defaults(func=cmd_store_blob)

    help_if_no_subcommand(parser)
