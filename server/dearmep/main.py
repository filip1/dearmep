# SPDX-FileCopyrightText: © 2022 Tim Weber
# SPDX-FileCopyrightText: © 2023 Jörn Bethune
# SPDX-FileCopyrightText: © 2023 iameru
#
# SPDX-License-Identifier: AGPL-3.0-or-later

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from starlette_exporter import PrometheusMiddleware, handle_metrics
from starlette_exporter.optional_metrics import (
    request_body_size,
    response_body_size,
)

from . import __version__, markdown_files, schedules, static_files
from .api import v1 as api_v1
from .config import APP_NAME, Config
from .database import get_session
from .phone import elks


_logger = logging.getLogger(__name__)


def require_operation_id(app: FastAPI) -> None:
    """
    Require all routes in the app to have the OpenAPI `operationId` field set.

    This allows e.g. auto-generated clients to use nice method names.
    """
    for route in app.routes:
        if (
            isinstance(route, APIRoute)
            and route.include_in_schema
            and not route.operation_id
        ):
            _logger.error(
                f'API function "{route.name}" ({", ".join(route.methods)} '
                f"{route.path}) does not have operation_id set"
            )


def require_working_database() -> None:
    """Require a database session to be obtainable.

    This will crash, for example, when using a non-threadsafe SQLite.
    """
    with get_session():
        pass


def setup_cors(app: FastAPI, config: Config) -> None:
    allowed_origins = config.api.cors.origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def create_app(config_dict: Optional[dict] = None) -> FastAPI:
    if config_dict is None:
        config = Config.load()
    else:
        config = Config.load_dict(config_dict)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator:  # noqa: ARG001
        for task in schedules.get_background_tasks(config):
            _logger.info(f"Loading background Task: {task.__name__}")
            await task()
        yield

    app = FastAPI(
        title=APP_NAME,
        version=__version__,
        lifespan=lifespan,
    )
    setup_cors(app, config)

    app.include_router(api_v1.router, prefix="/api/v1")
    elks.mount_router(app, "/phone")
    static_files.mount_if_configured(app, "/static")
    markdown_files.mount_if_configured(app, "/pages")

    app.add_middleware(
        PrometheusMiddleware,
        app_name=APP_NAME,
        group_paths=True,
        filter_unhandled_paths=True,
        optional_metrics=[request_body_size, response_body_size],
    )
    app.add_route("/metrics", handle_metrics)

    require_operation_id(app)
    require_working_database()

    return app
