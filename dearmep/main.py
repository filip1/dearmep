import logging
from typing import Optional

from fastapi import FastAPI
from starlette_exporter import PrometheusMiddleware, handle_metrics
from starlette_exporter.optional_metrics import request_body_size, \
    response_body_size

from . import __version__, static_files
from .api import v1 as api_v1
from .config import APP_NAME, Config


_logger = logging.getLogger(__name__)


def create_app(config_dict: Optional[dict] = None) -> FastAPI:
    if config_dict is None:
        Config.load()
    else:
        Config.load_dict(config_dict)

    app = FastAPI(
        title=APP_NAME,
        version=__version__,
    )

    app.include_router(api_v1.router, prefix="/api/v1")
    static_files.mount_if_configured(app, "/static")

    app.add_middleware(
        PrometheusMiddleware,
        app_name=APP_NAME,
        group_paths=True,
        optional_metrics=[request_body_size, response_body_size],
    )
    app.add_route("/metrics", handle_metrics)

    return app
