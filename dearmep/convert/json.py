import json
from typing import Iterable, Union

from ..progress import BaseTaskFactory


def obj2json(
    input: Iterable[Union[dict, list, str, float, bool, None]],
    tf: BaseTaskFactory,
    *,
    compact: bool = False,
    ascii_only: bool = True,
) -> Iterable[str]:
    """Convert objects to JSON."""
    seps = (",", ":") if compact else (", ", ": ")
    with tf.create_task("converting to JSON", total=input) as task:
        for obj in input:
            yield json.dumps(
                obj,
                indent=None,
                allow_nan=False,
                ensure_ascii=ascii_only,
                separators=seps,
            )
            task.advance()
