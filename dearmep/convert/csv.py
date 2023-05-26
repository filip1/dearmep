import csv
from typing import Dict, Iterable, Optional, Sequence

from ..progress import BaseTaskFactory, FlexiStrReader


def csv2dict(
    input: FlexiStrReader,
    tf: BaseTaskFactory,
    fieldnames: Optional[Sequence[str]] = None,
) -> Iterable[Dict[str, str]]:
    """Convert CSV data into a dict."""
    with tf.create_task("parsing CSV") as task:
        input.set_task(task)
        with input:
            reader = csv.DictReader(input, fieldnames)
            yield from reader
