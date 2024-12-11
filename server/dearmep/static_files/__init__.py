# SPDX-FileCopyrightText: © 2023 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

import logging
from pathlib import Path
from typing import Literal, Optional

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from ..config import ENV_PREFIX, Settings


_logger = logging.getLogger(__name__)


DEMO_TEMPLATE = Path(Path(__file__).parent, "demo.html").read_text(
    encoding="utf-8"
)


def demo_html(
    *,
    protocol: Literal["http", "https"],
    host: str,
    port: Optional[int],
    path: str,
) -> str:
    base_url = f"{protocol}://{host}{'' if port is None else f':{port}'}/"
    static_url = f"{base_url.rstrip('/')}{path}/"
    return DEMO_TEMPLATE.format(
        base_url=base_url,
        static_url=static_url,
    )


def mount_if_configured(app: FastAPI, path: str) -> None:
    settings = Settings()
    static_files_dir = settings.static_files_dir
    if static_files_dir is None:
        _logger.info(
            f"{ENV_PREFIX}STATIC_FILES_DIR is unset, will not serve "
            "static files"
        )
        return

    if settings.demo_page:

        @app.get(
            "/",
            operation_id="getDemoHTML",
            summary="Get Demo HTML",
            response_class=HTMLResponse,
        )
        async def get_demo_html(req: Request) -> str:  # noqa: RUF029
            """
            Return a HTML page that can be used to demo the application.

            This is only available if the environment variable
            `DEARMEP_DEMO_PAGE` is set to `y` when starting the application.
            Additionally, `DEARMEP_STATIC_FILES_DIR` needs to be configured, or
            static files need to be embedded in the application (which is the
            case for official releases).
            """
            return demo_html(
                protocol="http"
                if req.url.scheme.lower() == "http"
                else "https",
                host=req.url.hostname or "localhost",
                port=req.url.port,
                path=path,
            )

    app.mount(path, StaticFiles(directory=static_files_dir), "static")
    _logger.info(
        f"will serve static files from {static_files_dir}, "
        f"{'including' if settings.demo_page else 'but without'} demo page"
    )
