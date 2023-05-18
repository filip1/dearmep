import csv
from typing import Dict, Iterable, Optional, Sequence

from ..progress import BaseTaskFactory, FlexiReader


def csv2dict(
    input: FlexiReader,
    tf: BaseTaskFactory,
    fieldnames: Optional[Sequence[str]] = None,
) -> Iterable[Dict[str, str]]:
    """Convert CSV data into a dict."""
    with tf.create_task("parsing CSV") as task:
        input.task = task
        with input.lines() as lines:
            reader = csv.DictReader(lines, fieldnames)
            yield from reader
