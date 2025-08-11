import csv
import re
import subprocess
from pathlib import Path
from typing import Any, TextIO

import yaml


KEY_LINE = re.compile(r"^\s*([a-zA-Z0-9._-]+):.*$")
COMMENT_LINE = re.compile(r"^\s*#\s*(.*)$")


def read_config(path: Path) -> tuple[list[str], dict[str, Any]]:
    with path.open("r") as file:
        lines = [line.rstrip() for line in file]
        file.seek(0)
        yaml_dict = yaml.safe_load(file)
    return lines, yaml_dict


def write_strings_csv(
    config: dict[str, Any], lines: list[str], outfile: TextIO
) -> None:
    l10n = config["l10n"]
    strings = {
        key: value
        for key, value in {**l10n["strings"], **l10n["frontend_strings"]}.items()
    }
    result: dict[str, dict[str, str]] = {}
    columns: dict[str, None] = {"id": None, "comment": None}
    ignored: set[str] = set()
    for line_num, line in enumerate(lines):
        if (match := KEY_LINE.search(line)) and (key := match[1]) in strings:
            if not isinstance(strings[key], dict):
                print(f'ignoring key "{key}" because it doesn\'t contain a mapping')
                ignored.add(key)
                continue
            comments: list[str] = []
            for line in lines[line_num - 1 : 0 : -1]:
                if match := COMMENT_LINE.search(line):
                    comments.insert(0, match[1])
                else:
                    break
            columns = {**columns, **{lang: None for lang in strings[key]}}
            result[key] = {"id": key, "comment": "\n".join(comments), **strings[key]}
    for key in strings:
        if key not in result and key not in ignored:
            raise Exception(f"missing key {key}")
    writer = csv.DictWriter(outfile, columns.keys())
    writer.writeheader()
    for row in result.values():
        writer.writerow(row)


if __name__ == "__main__":
    outpath = Path("strings.csv")
    config, lines = read_config(
        Path(__file__).parent.parent / "server/dearmep/example-config.yaml"
    )
    with outpath.open("w") as csvfile:
        write_strings_csv(lines, config, csvfile)
    subprocess.run(
        [
            "libreoffice",
            "--headless",
            "--infilter=CSV:44,34,76,1",
            "--convert-to",
            "xlsx",
            str(outpath),
        ],
        check=True,
    )

