from fastapi import FastAPI

from . import __version__
from .api import v1 as api_v1
from .config import APP_NAME, Config, Settings
from .metrics import Prometheus


def start() -> FastAPI:
    settings = Settings()
    Config.load_yaml_file(settings.config_file)

    app = FastAPI(
        title=APP_NAME,
        version=__version__,
    )

    Prometheus.get_instance(app).enable()

    app.include_router(api_v1.router, prefix="/api/v1")

    return app
