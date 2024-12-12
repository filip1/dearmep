# SPDX-FileCopyrightText: © 2023 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

import dataclasses
import logging
from functools import lru_cache
from pathlib import Path
from typing import Annotated, NoReturn, Optional

from defusedxml import ElementTree
from fastapi import FastAPI, HTTPException, status
from fastapi import Path as PathParam
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from jinja2 import Environment, FileSystemLoader, select_autoescape
from markdown_it import MarkdownIt
from markupsafe import Markup

from .config import ENV_PREFIX, Settings


_logger = logging.getLogger(__name__)


DOCS_DIR = "docs"
STATIC_DIR = "static"
TEMPLATES_DIR = "templates"
TEMPLATE_NAME = "default.html.jinja"


@dataclasses.dataclass
class Document:
    title: Optional[str]
    content: str


md = MarkdownIt()


@lru_cache
def get_doc(path: Path) -> Document:
    markdown = path.read_text()
    html = md.render(markdown)
    # Wrap the HTML in a document element, required to be well-formed XML.
    tree = ElementTree.fromstring(f"<body>{html}</body>")
    h1 = tree.find("h1")
    return Document(
        title=h1.text if h1 is not None else None,
        content=str(Markup(html)),  # noqa: RUF035
    )


def mount_if_configured(app: FastAPI, prefix: str) -> None:
    settings = Settings()
    markdown_dir_setting = settings.markdown_files_dir
    if markdown_dir_setting is None:
        _logger.info(
            f"{ENV_PREFIX}MARKDOWN_FILES_DIR is unset, will not serve "
            "Markdown files"
        )
        return
    markdown_dir = markdown_dir_setting.resolve(strict=True)

    for dir in (DOCS_DIR, STATIC_DIR, TEMPLATES_DIR):
        if not Path(markdown_dir, dir).is_dir():
            raise FileNotFoundError(
                f"no `{dir}` sub-directory in Markdown directory"
            )
    if not Path(markdown_dir, TEMPLATES_DIR, TEMPLATE_NAME).exists():
        raise FileNotFoundError(
            f"no `{TEMPLATES_DIR}/{TEMPLATE_NAME}` in Markdown directory"
        )

    jinja_env = Environment(
        loader=FileSystemLoader(Path(markdown_dir, TEMPLATES_DIR)),
        autoescape=select_autoescape(),
    )
    template = jinja_env.get_template(TEMPLATE_NAME)

    def raise_404(path: str) -> NoReturn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"file not found: {path}",
        )

    @app.get(
        prefix + "/{path:path}/{lang}/",
        operation_id="getMarkdownDoc",
        summary="Get Markdown Document",
        responses={
            404: {"description": "Document Not Found"},
        },
    )
    def get_markdown_doc(
        path: Annotated[
            str,
            PathParam(
                description="Name of the document. Will be mapped to a "
                "directory in the `docs` directory of the "
                "`DEARMEP_MARKDOWN_FILES_DIR`.",
            ),
        ],
        lang: Annotated[
            str,
            PathParam(
                description="Language to retrieve the document in. Will be "
                "mapped to an actual file like `en.md` inside of the `path` "
                "corresponding to the requested document.",
            ),
        ],
    ) -> HTMLResponse:
        """
        Serve a Markdown document from the server, converted to HTML.

        This is only available if the environment variable
        `DEARMEP_MARKDOWN_FILES_DIR` is configured. See _Serving Markdown
        Files_ in the documentation for details.
        """
        lang = lang.lower()
        try:
            abs_path = Path(
                markdown_dir, DOCS_DIR, path, f"{lang}.md"
            ).resolve(strict=True)
        except FileNotFoundError:
            raise_404(path)
        if not str(abs_path).startswith(str(Path(markdown_dir, DOCS_DIR))):
            # Prevent escaping from the DOCS_DIR.
            raise_404(path)

        doc = get_doc(abs_path)
        return HTMLResponse(
            template.render(
                {
                    **dataclasses.asdict(doc),
                    "base_path": f"{prefix}/",
                    "language": lang,
                }
            )
        )

    app.mount(
        prefix,
        StaticFiles(directory=Path(markdown_dir, "static")),
        "md_static",
    )

    _logger.info(f"will serve Markdown files from {markdown_dir}")
