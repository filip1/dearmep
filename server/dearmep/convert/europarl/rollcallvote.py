# SPDX-FileCopyrightText: © 2023 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from typing import TypeVar
from xml.dom import pulldom  # noqa: S409

from defusedxml.pulldom import parse as pulldom_parse

from ...progress import BaseTaskFactory, FlexiBytesReader
from ..tabular import Tabular
from ..xml import get_text


DESCRIPTION_TAG = "RollCallVote.Description.Text"
RESULT_TAG = "RollCallVote.Result"
GROUP_TAG = "Result.PoliticalGroup.List"
MEMBER_TAG = "PoliticalGroup.Member.Name"

RESULT_MAP = {
    "Result.For": "+",
    "Result.Against": "-",
    "Result.Abstention": "0",
}


T = TypeVar("T", bound=Tabular)


def list_topics(
    input: FlexiBytesReader,
    tf: BaseTaskFactory,
    table_class: type[T],
) -> T:
    table = table_class("ID", "Description")
    with tf.create_task("parsing XML") as task:
        input.set_task(task)
        with input as stream:
            doc = pulldom_parse(stream)
            for ev, node in doc:
                if ev == pulldom.START_ELEMENT and node.tagName == RESULT_TAG:
                    topic_id = node.getAttribute("Identifier")
                elif (
                    ev == pulldom.START_ELEMENT
                    and node.tagName == DESCRIPTION_TAG
                ):
                    doc.expandNode(node)
                    topic_text = get_text(node)
                    table.append(topic_id, topic_text)
    return table


def list_votes(
    input: FlexiBytesReader,
    tf: BaseTaskFactory,
    table_class: type[T],
    topic: str,
) -> T:
    table = table_class("PersID", "MEPID", "Group", "Name", "Vote")
    with tf.create_task("parsing XML") as task:  # noqa: PLR1702
        input.set_task(task)
        with input as stream:
            doc = pulldom_parse(stream)
            for ev, node in doc:
                if ev != pulldom.START_ELEMENT or node.tagName != RESULT_TAG:
                    continue
                if node.getAttribute("Identifier") != topic:
                    continue
                doc.expandNode(node)
                for vote_child in node.childNodes:
                    if vote_child.tagName not in RESULT_MAP:
                        continue
                    vote = RESULT_MAP[vote_child.tagName]
                    for group_child in vote_child.childNodes:
                        if group_child.tagName != GROUP_TAG:
                            continue
                        group = group_child.getAttribute("Identifier")
                        for person_child in group_child.childNodes:
                            if person_child.tagName != MEMBER_TAG:
                                continue
                            table.append(
                                person_child.getAttribute("PersId"),
                                person_child.getAttribute("MepId"),
                                group,
                                get_text(person_child),
                                vote,
                            )
                return table
            raise KeyError(f"topic {topic} not found")
