import dataclasses
from functools import lru_cache
import logging
from pathlib import Path
from typing import Optional

import defusedxml.ElementTree as ET  # type: ignore[import]
from fastapi import FastAPI, HTTPException, status
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


@lru_cache()
def get_doc(path: Path) -> Document:
    markdown = path.read_text()
    html = md.render(markdown)
    tree = ET.fromstring(f"<body>{html}</body>")  # needs a document element
    h1 = tree.find("h1")
    return Document(
        title=h1.text if h1 is not None else None,
        content=str(Markup(html)),
    )


def mount_if_configured(app: FastAPI, prefix: str):
    settings = Settings()
    markdown_dir_setting = settings.markdown_files_dir
    if markdown_dir_setting is None:
        _logger.info(
            f"{ENV_PREFIX}MARKDOWN_FILES_DIR is unset, will not serve "
            "Markdown files")
        return
    markdown_dir = markdown_dir_setting.resolve(strict=True)

    for dir in (DOCS_DIR, STATIC_DIR, TEMPLATES_DIR):
        if not Path(markdown_dir, dir).is_dir():
            raise FileNotFoundError(
                f"no `{dir}` sub-directory in Markdown directory")
    if not Path(markdown_dir, TEMPLATES_DIR, TEMPLATE_NAME).exists():
        raise FileNotFoundError(
            f"no `{TEMPLATES_DIR}/{TEMPLATE_NAME}` in Markdown directory")

    jinja_env = Environment(
        loader=FileSystemLoader(Path(markdown_dir, TEMPLATES_DIR)),
        autoescape=select_autoescape(),
    )
    template = jinja_env.get_template(TEMPLATE_NAME)

    def raise_404(path: str):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"file not found: {path}",
        )

    @app.get(
        prefix + "/{path:path}/{lang}/", operation_id="getMarkdownDoc",
        summary="Get Markdown document",
    )
    def get_markdown_doc(path: str, lang: str):
        lang = lang.lower()
        try:
            abs_path = Path(markdown_dir, DOCS_DIR, path, f"{lang}.md") \
                .resolve(strict=True)
        except FileNotFoundError:
            raise_404(path)
        if not str(abs_path).startswith(str(Path(markdown_dir, DOCS_DIR))):
            raise_404(path)

        doc = get_doc(abs_path)
        return HTMLResponse(template.render({
            **dataclasses.asdict(doc),
            "base_path": f"{prefix}/",
            "language": lang,
        }))

    app.mount(
        prefix,
        StaticFiles(directory=Path(markdown_dir, "static")),
        "md_static",
    )

    _logger.info(f"will serve Markdown files from {markdown_dir}")
