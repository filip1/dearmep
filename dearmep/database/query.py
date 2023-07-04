from .connection import NoResultFound, Session, select
from .models import Blob


def get_blob_by_name(session: Session, name: str) -> Blob:
    try:
        return session.exec(select(Blob).where(Blob.name == name)).one()
    except NoResultFound:
        raise KeyError(f"no blob named `{name}`")
