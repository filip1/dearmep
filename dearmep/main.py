import logging
from typing import Optional

from fastapi import FastAPI
from fastapi.routing import APIRoute
from pydantic import ValidationError
from starlette_exporter import PrometheusMiddleware, handle_metrics
from starlette_exporter.optional_metrics import request_body_size, \
    response_body_size
from yaml.parser import ParserError

from . import __version__, static_files
from .api import v1 as api_v1
from .config import APP_NAME, Config, ENV_PREFIX, Settings, is_config_missing


_logger = logging.getLogger(__name__)


def require_operation_id(app: FastAPI):
    """
    Require all routes in the app to have the OpenAPI `operationId` field set.

    This allows e.g. auto-generated clients to use nice method names.
    """
    for route in app.routes:
        if isinstance(route, APIRoute) and not route.operation_id:
            _logger.error(
                f'API function "{route.name}" ({", ".join(route.methods)} '
                f"{route.path}) does not have operation_id set"
            )


def create_app(config_dict: Optional[dict] = None) -> FastAPI:
    try:
        settings = Settings()
    except ValidationError as e:
        if is_config_missing(e):
            _logger.error(
                "The configuration file was not found. This usually means "
                f"that you did not set the {ENV_PREFIX}CONFIG environment "
                "variable to the config file name, or its path is incorrect.",
                exc_info=True,
            )
        raise

    try:
        if config_dict is None:
            Config.load_yaml_file(settings.config_file)
        else:
            Config.load_dict(config_dict)
    except ParserError:
        _logger.error(
            "There was an error loading your YAML config.",
            exc_info=True,
        )
        raise
    except ValidationError:
        _logger.error(
            "Your config file is correct YAML, but did not pass validation.",
            exc_info=True,
        )
        raise

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

    require_operation_id(app)

    return app
