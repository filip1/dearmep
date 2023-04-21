import logging
from typing import Optional
from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
from pydantic import ValidationError
from yaml.parser import ParserError

from . import __version__, static_files
from .api import v1 as api_v1
from .config import APP_NAME, Config, ENV_PREFIX, Settings, is_config_missing


_logger = logging.getLogger(__name__)


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

    @app.on_event("startup")
    def prometheus_instrument():
        Instrumentator(
            should_group_status_codes=False,
        ).instrument(app).expose(app)

    app.include_router(api_v1.router, prefix="/api/v1")
    static_files.mount_if_configured(app, "/static")

    return app
