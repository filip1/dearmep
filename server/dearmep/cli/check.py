# SPDX-FileCopyrightText: © 2023 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from __future__ import annotations

import logging
import sys
from typing import TYPE_CHECKING, Callable


if TYPE_CHECKING:
    from argparse import ArgumentParser, _SubParsersAction
    from collections.abc import Mapping

    from . import Context

from ..config import APP_NAME, Config, L10nEntry


_logger = logging.getLogger(__name__)


# For the following keys, missing translations will output only a warning, not
# an error.
WARNING_KEYS = [
    "maintenance.message",
    "verification.enterNumber.policyLinkUrl",
]


def cmd_translations(ctx: Context) -> None:
    def check_entries(section: str, entries: Mapping[str, L10nEntry]) -> bool:
        had_error = False
        for key, entry_model in entries.items():
            if section == "frontend" and key.startswith("languages."):
                continue
            entry = entry_model.__root__
            prefix = f"{section} string `{key}`"
            if isinstance(entry, str):
                _logger.warning(
                    f"{prefix} is not translated, i.e. it is using the same "
                    "text for every language"
                )
            else:
                missing = [
                    lang for lang in cfg.l10n.languages if lang not in entry
                ]
                if missing:
                    _logger.log(
                        logging.WARNING
                        if key in WARNING_KEYS
                        else logging.ERROR,
                        f"{prefix} is not translated into "
                        + ", ".join(missing),
                    )
                    had_error = key not in WARNING_KEYS
        return had_error

    ctx.setup_logging()
    cfg = Config.load()

    had_error = check_entries("frontend", cfg.l10n.frontend_strings.__root__)
    had_error = (
        check_entries(
            "backend",
            {
                fname: getattr(cfg.l10n.strings, fname)
                for fname in cfg.l10n.strings.__fields__
            },
        )
        or had_error
    )

    if had_error:
        sys.exit(1)
    sys.exit(0)


def add_parser(
    subparsers: _SubParsersAction,
    help_if_no_subcommand: Callable,
) -> None:
    parser: ArgumentParser = subparsers.add_parser(
        "check",
        help="health checks on the system and configuration",
        description=f"Perform health checks on {APP_NAME} system & config.",
    )
    subsub = parser.add_subparsers(metavar="TARGET")

    translations = subsub.add_parser(
        "translations",
        help="ensure all strings are translated",
        description="Look for untranslated strings in the configuration. Will "
        "exit with return code 0 if everything is translated, 1 if not. A few "
        "translation keys count as optional; they will only emit a warning "
        "and not count as an error.",
    )
    translations.set_defaults(func=cmd_translations)

    help_if_no_subcommand(parser)
