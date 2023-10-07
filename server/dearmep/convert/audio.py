from mimetypes import guess_type
from pathlib import Path
from typing import Optional

from ..database.models import Blob


def audio2blob(
    type: str,
    path: Path,
    *,
    description: Optional[str] = None,
) -> Blob:
    data = path.read_bytes()
    mimetype = guess_type(path, strict=False)[0]
    return Blob(
        type=type,
        mime_type=mimetype,
        name=path.name,
        description=description,
        data=data,
    )
