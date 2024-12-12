# SPDX-FileCopyrightText: © 2023 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

import json
from collections.abc import Iterable
from typing import IO, Any, Optional

from ..config import CMD_NAME
from ..database.models import (
    DestinationDump,
    DestinationGroupDump,
    DumpableModels,
)


META_PREFIX = f"_{CMD_NAME}_"
TYPE_KEY = f"{META_PREFIX}type"
VERSION_KEY = f"{META_PREFIX}stream"
STR2TYPE: dict[str, type[DumpableModels]] = {
    "destination": DestinationDump,
    "group": DestinationGroupDump,
}
TYPE2STR = {t: s for s, t in STR2TYPE.items()}


class DumpFormatError(Exception):
    pass


def dump_model(model: DumpableModels) -> dict[str, Any]:
    return {
        TYPE_KEY: TYPE2STR[type(model)],
        **model.dict(exclude_none=True),
    }


def dump_iter(models: Iterable[DumpableModels]) -> Iterable[dict[str, Any]]:
    yield {VERSION_KEY: 1}
    for model in models:
        yield dump_model(model)


def dump_iter_json(models: Iterable[DumpableModels]) -> Iterable[str]:
    for el in dump_iter(models):
        yield json.dumps(el)


def parse_dump_obj(data: dict[str, Any], e_pref: str = "") -> DumpableModels:
    if TYPE_KEY not in data:
        raise DumpFormatError(f"{e_pref}missing '{TYPE_KEY}'")
    linetype = data[TYPE_KEY]
    modeltype = STR2TYPE.get(linetype)
    if not modeltype:
        raise DumpFormatError(f"{e_pref}unknown type '{linetype}'")

    del data[TYPE_KEY]
    return modeltype.parse_obj(data)


def read_dump_json(input: IO[bytes]) -> Iterable[DumpableModels]:
    version: Optional[float] = None
    for lnum, line in enumerate(input, 1):
        if len(line.strip()) == 0:
            continue
        data = json.loads(line)
        if not isinstance(data, dict):
            raise DumpFormatError(f"line {lnum} is not an object")

        if version is None:
            if VERSION_KEY not in data:
                raise DumpFormatError(
                    "expected a dump version number as the first line"
                )
            if not isinstance(data[VERSION_KEY], (int, float)):
                raise DumpFormatError(
                    "expected dump version number to be a number, got "
                    f"{data[VERSION_KEY]} ({type(data[VERSION_KEY])})"
                )
            version = data[VERSION_KEY]
            if version > 1:
                raise DumpFormatError(
                    f"expected dump version 1, got {version}"
                )
            continue  # to the next element

        yield parse_dump_obj(data, f"line {lnum}: ")
