from fastapi import FastAPI

from . import __version__
from .metrics import Prometheus


app = FastAPI(
    title="Callament",
    version=__version__,
)

Prometheus.get_instance(app).enable()
