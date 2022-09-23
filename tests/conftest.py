from contextlib import contextmanager
from os import environ
from pathlib import Path
from typing import Callable, Optional
from fastapi import FastAPI
from fastapi.testclient import TestClient

import pytest

from callament.config import Config
from callament.main import start


@contextmanager
def fastapi_factory_func(
    config_path: Optional[Path] = None,
    config_content: Optional[bytes] = None,
):
    top_dir = Path(__file__).parent.parent
    # By default, let the tests use the example config.
    config_path = Path(top_dir, "example-config.yaml") \
        if config_path is None else config_path

    # Allow dynamically passing config YAML.
    if config_content is not None:
        config_path.write_bytes(config_content)

    # Point to the example (or override) config file.
    cfg_var = "CALLAMENT_CONFIG"
    config_before = environ.get(cfg_var)
    environ[cfg_var] = str(config_path)

    try:
        yield start
    finally:
        # Restore the config env variable's setting. Probably unnecessary.
        if config_before is None:
            del environ[cfg_var]
        else:
            environ[cfg_var] = config_before


@pytest.fixture
def fastapi_factory(request: pytest.FixtureRequest, tmp_path: Path):
    # Allow choosing a different config file.
    path_marker = request.node.get_closest_marker("config_path")
    config_path = None if path_marker is None else path_marker.args[0]

    # Allow dynamically passing config YAML.
    content_marker = request.node.get_closest_marker("config_content")
    config_content = None
    if content_marker is not None:
        config_path = tmp_path / "override.yaml"
        config_content = content_marker.args[0]

    with fastapi_factory_func(config_path, config_content) as start:
        yield start


@pytest.fixture
def fastapi_app(fastapi_factory: Callable[[], FastAPI]):
    tests_dir = Path(__file__).parent

    app = fastapi_factory()
    config = Config.get()

    # Change the MMDB to point to the test one.
    geo_mmdb_before = config.l10n.geo_mmdb
    config.l10n.geo_mmdb = Path(tests_dir, "geo_ip", "test.mmdb")

    yield app

    # Restore the MMDB setting.
    config.l10n.geo_mmdb = geo_mmdb_before


@pytest.fixture
def client(fastapi_app: FastAPI):
    yield TestClient(fastapi_app)
