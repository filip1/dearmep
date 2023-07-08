from __future__ import annotations
from pathlib import Path
from typing import Callable, Dict, Iterable, Optional, Type

from sqlmodel import SQLModel, Session

from ..convert.dump import DumpFormatException
from ..convert.image import image2blob
from .models import Contact, Destination, DestinationDump, DestinationGroup, \
    DestinationGroupDump, DumpableModels


class Importer:
    def __init__(
        self,
        *,
        portrait_template: Optional[str] = None,
        fallback_portrait: Optional[Path] = None,
    ) -> None:
        self._dump2db: Dict[Type[DumpableModels], Callable] = {
            DestinationGroupDump: self._create_destination_group,
            DestinationDump: self._create_destination,
        }
        self._groups: Dict[str, DestinationGroup] = {}
        self._portrait_tpl = portrait_template

        self._fallback_portrait = image2blob(
            "portrait", fallback_portrait,
            description="fallback portrait",
        ) if fallback_portrait else None

    def _create_destination(self, input: DestinationDump) -> Destination:
        contacts = list(
            Contact.from_orm(contact)
            for contact in input.contacts
        )
        groups = list(
            self._groups[group_id]
            for group_id in input.groups
        )
        dest = Destination.from_orm(input)
        dest.contacts = contacts
        dest.groups = groups

        if self._portrait_tpl:
            portrait_path = Path(self._portrait_tpl.format(id=dest.id))
            if portrait_path.exists():
                dest.portrait = image2blob(
                    "portrait", portrait_path,
                    description=f"portrait for Destination {dest.id}",
                )
        if not dest.portrait and self._fallback_portrait:
            dest.portrait = self._fallback_portrait
        return dest

    def _create_destination_group(
        self,
        input: DestinationGroupDump,
    ) -> DestinationGroup:
        dg = DestinationGroup.from_orm(input)
        if dg.id in self._groups:
            raise DumpFormatException(f"duplicate group: {dg.id}")
        self._groups[dg.id] = dg
        return dg

    def import_dump(self, session: Session, objs: Iterable[DumpableModels]):
        self._groups = {}
        for obj in objs:
            obj_type = type(obj)
            if obj_type not in self._dump2db:
                raise DumpFormatException(f"unknown type: {obj_type}")
            model: SQLModel = self._dump2db[obj_type](obj)
            session.add(model)
