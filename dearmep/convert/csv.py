import csv
from typing import Sequence

from ..models import Person, PersonContact
from .util import Progress, open_file_for_write


PERSON_FIELDS = (
    "id", "name", "country", "group", "party",
) + PersonContact.WELL_KNOWN_KINDS


def persons_to_csv(
    persons: Sequence[Person],
    file: str,
    *,
    progress: Progress,
):
    task = progress.add_task("Writing persons CSV", total=len(persons))
    with open_file_for_write(file) as f:
        writer = csv.DictWriter(f, PERSON_FIELDS, extrasaction="ignore")
        writer.writeheader()
        for person in persons:
            writer.writerow({
                k: v if isinstance(v, str) else ""
                for k, v in {
                    **person.dict(),
                    **person.contact_dict(single=True),
                }.items()
                if k in PERSON_FIELDS
            })
            progress.advance(task)
