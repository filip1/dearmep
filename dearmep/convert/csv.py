import csv
import json
from typing import Iterable, Optional, Sequence

from ..progress import BaseTaskFactory, FlexiReader


def csv2json(
    input: FlexiReader,
    tf: BaseTaskFactory,
    fieldnames: Optional[Sequence[str]] = None,
    compact: bool = False,
    ascii_only: bool = True,
) -> Iterable[str]:
    """Convert CSV data into JSON strings."""
    seps = (",", ":") if compact else (", ", ": ")

    with tf.create_task("converting CSV to JSON") as task:
        input.task = task
        with input.lines() as lines:
            reader = csv.DictReader(lines, fieldnames)
            for row in reader:
                yield json.dumps(
                    row,
                    indent=None,
                    allow_nan=False,
                    ensure_ascii=ascii_only,
                    separators=seps,
                )
