import json
from typing import Any, Dict, Iterable

from ..config import CMD_NAME
from ..database.models import DestinationDump, DestinationGroupDump, \
    DumpableModels


META_PREFIX = f"_{CMD_NAME}_"
TYPE_KEY = f"{META_PREFIX}type"
VERSION_KEY = f"{META_PREFIX}stream"
STR2TYPE = {
    "destination": DestinationDump,
    "group": DestinationGroupDump,
}
TYPE2STR = {t: s for s, t in STR2TYPE.items()}


def dump_model(model: DumpableModels) -> Dict[str, Any]:
    return {
        TYPE_KEY: TYPE2STR[type(model)],
        **model.dict(exclude_none=True),
    }


def dump_iter(models: Iterable[DumpableModels]) -> Iterable[Dict[str, Any]]:
    yield {VERSION_KEY: 1}
    for model in models:
        yield dump_model(model)


def dump_iter_json(models: Iterable[DumpableModels]) -> Iterable[str]:
    for el in dump_iter(models):
        yield json.dumps(el)
