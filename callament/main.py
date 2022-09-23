import logging
from fastapi import FastAPI
from pydantic import ValidationError
from yaml.parser import ParserError

from . import __version__
from .api import v1 as api_v1
from .config import APP_NAME, Config, ENV_PREFIX, Settings
from .metrics import Prometheus


_logger = logging.getLogger(__name__)


def start() -> FastAPI:
    try:
        settings = Settings()
    except ValidationError as e:
        err = e.errors()
        if len(err) == 1 and err[0]["loc"] == ("config_file",) \
           and err[0]["type"] == "value_error.path.not_exists":
            _logger.error(
                "The configuration file was not found. This usually means "
                f"that you did not set the {ENV_PREFIX}CONFIG environment "
                "variable to the config file name, or its path is incorrect.",
                exc_info=True,
            )
        raise

    try:
        Config.load_yaml_file(settings.config_file)
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

    Prometheus.get_instance(app).enable()

    app.include_router(api_v1.router, prefix="/api/v1")

    return app
