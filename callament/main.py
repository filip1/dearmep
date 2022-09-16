from fastapi import FastAPI

from . import __version__
from .api import v1 as api_v1
from .metrics import Prometheus


app = FastAPI(
    title="Callament",
    version=__version__,
)

Prometheus.get_instance(app).enable()

app.include_router(api_v1.router, prefix="/api/v1")
