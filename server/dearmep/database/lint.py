from typing import Callable, List

from sqlmodel import col

from .connection import Session, select
from .models import Destination


def destinations_without_name_audio(session: Session) -> List[Destination]:
    return session.exec(
        select(Destination)
        .where(col(Destination.name_audio_id).is_(None))
    ).all()


def all_issues(session: Session) -> List[str]:
    def add_issue_if_any(
        issues_list: List[str],
        problem_items: list,
        *,
        message: str,
        formatter: Callable,
    ):
        if not len(problem_items):
            return

        issues_list.append(
            f"{message.format(pl='' if len(problem_items) == 1 else 's')}: " +
            ", ".join(map(formatter, problem_items))
        )

    def destination_formatter(dest: Destination) -> str:
        return f"{dest.id} ({dest.name})"

    issues: List[str] = []

    add_issue_if_any(
        issues,
        destinations_without_name_audio(session),
        message="Destination{pl} without name audio",
        formatter=destination_formatter,
    )

    return issues


def print_all_issues(session: Session):
    all = all_issues(session)

    if not len(all):
        print("No issues found.")
        return

    for issue in all_issues(session):
        print(issue)
