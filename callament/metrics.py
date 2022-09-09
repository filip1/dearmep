from typing import Dict, Optional

from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator


class Prometheus:
    _instances: Dict[FastAPI, Optional["Prometheus"]] = {}

    def __init__(self, app: FastAPI):
        self._app = app
        self._instr = Instrumentator(
            should_group_status_codes=False,
        )

    @classmethod
    def get_instance(cls, app: FastAPI):
        if app not in cls._instances:
            cls._instances[app] = cls(app)
        return cls._instances[app]

    def enable(self):
        self._instr.instrument(self._app).expose(self._app)
