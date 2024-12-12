# SPDX-FileCopyrightText: © 2023 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from typing import Callable

from sqlmodel import col

from .connection import Session, select
from .models import Destination


def destinations_without_name_audio(session: Session) -> list[Destination]:
    return session.exec(
        select(Destination).where(col(Destination.name_audio_id).is_(None))
    ).all()


def all_issues(session: Session) -> list[str]:
    def add_issue_if_any(
        issues_list: list[str],
        problem_items: list,
        *,
        message: str,
        formatter: Callable,
    ) -> None:
        if not len(problem_items):
            return

        issues_list.append(
            f"{message.format(pl='' if len(problem_items) == 1 else 's')}: "
            + ", ".join(map(formatter, problem_items))
        )

    def destination_formatter(dest: Destination) -> str:
        return f"{dest.id} ({dest.name})"

    issues: list[str] = []

    add_issue_if_any(
        issues,
        destinations_without_name_audio(session),
        message="Destination{pl} without name audio",
        formatter=destination_formatter,
    )

    return issues


def print_all_issues(session: Session) -> None:
    all = all_issues(session)

    if not len(all):
        print("No issues found.")  # noqa: T201
        return

    for issue in all_issues(session):
        print(issue)  # noqa: T201
