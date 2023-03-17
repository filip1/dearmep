from typing import IO, Union, cast
from xml.dom import pulldom
from xml.dom.minidom import Element, Text

from defusedxml.pulldom import parse as pulldom_parse  # type: ignore

from ..csv import table_to_csv
from ..util import Table, get_console, open_file_for_read, progress


DESCRIPTION_TAG = "RollCallVote.Description.Text"
RESULT_TAG = "RollCallVote.Result"
GROUP_TAG = "Result.PoliticalGroup.List"
MEMBER_TAG = "PoliticalGroup.Member.Name"

RESULT_MAP = {
    "Result.For": "+",
    "Result.Against": "-",
    "Result.Abstention": "0",
}


def get_text(node: Union[Element, Text]) -> str:
    if node.nodeType == node.TEXT_NODE:
        # This casting is plain ugly, but otherwise mypy doesn't know it's str.
        return str(cast(Text, node).data)
    return "".join(
        get_text(child)
        for child in node.childNodes
    )


def list_topics(file: IO[bytes]) -> Table:
    table = Table("ID", "Description")
    doc = pulldom_parse(file)
    for ev, node in doc:
        if ev == pulldom.START_ELEMENT and node.tagName == RESULT_TAG:
            topic_id = node.getAttribute("Identifier")
        elif ev == pulldom.START_ELEMENT and node.tagName == DESCRIPTION_TAG:
            doc.expandNode(node)
            topic_text = get_text(node)
            table.add_row(topic_id, topic_text)
    return table


def list_votes(file: IO[bytes], topic: str) -> Table:
    table = Table("Group", "MEPID", "PersID", "Name", "Vote")
    doc = pulldom_parse(file)
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
                    table.add_row(
                        group,
                        person_child.getAttribute("MepId"),
                        person_child.getAttribute("PersId"),
                        get_text(person_child),
                        vote,
                    )
        return table
    raise KeyError(f"topic {topic} not found")


def cli():
    from argparse import ArgumentParser

    parser = ArgumentParser(
        description="interpret European Parliament roll call vote result XML",
    )

    parser.add_argument(
        "inputfile",
        help="path to an XML file containing the results, or '-' for stdin",
    )

    commands = parser.add_mutually_exclusive_group(required=True)

    commands.add_argument(
        "--list-topics",
        action="store_true",
        help="list the individual topics contained in the XML",
    )

    commands.add_argument(
        "--list-votes", metavar="topic",
        help="list each MEP's vote on a given topic",
    )

    parser.add_argument(
        "--as-table",
        action="store_true",
        help="show the result as a table on stdout",
    )

    parser.add_argument(
        "--to-csv", metavar="filename",
        nargs="?", const="-",
        help="convert the result to CSV format, write to a file (or stdout)",
    )

    args = parser.parse_args()
    with progress() as p:
        with open_file_for_read(
            args.inputfile, progress=p, description="Reading XML",
        ) as file:
            if args.list_topics:
                table = list_topics(file)
            elif args.list_votes:
                table = list_votes(file, args.list_votes)
        if args.as_table:
            get_console().print(table.as_rich_table())
        if args.to_csv:
            table_to_csv(table, args.to_csv, progress=p)


if __name__ == "__main__":
    from .rollcallvote import cli as run_cli
    run_cli()
