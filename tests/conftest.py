from os import environ
from pathlib import Path
from typing import Callable
from fastapi import FastAPI
from fastapi.testclient import TestClient

import pytest

from callament.config import Config
from callament.main import start


@pytest.fixture
def fastapi_factory(request: pytest.FixtureRequest, tmp_path: Path):
    top_dir = Path(__file__).parent.parent
    path_marker = request.node.get_closest_marker("config_path")
    config_path = str(Path(top_dir, "example-config.yaml")) \
        if path_marker is None else path_marker.args[0]

    # Allow dynamically passing config YAML.
    content_marker = request.node.get_closest_marker("config_content")
    if content_marker is not None:
        config_path = tmp_path / "override.yaml"
        config_path.write_bytes(content_marker.args[0])

    # Point to the example (or override) config file.
    cfg_var = "CALLAMENT_CONFIG"
    config_before = environ.get(cfg_var)
    environ[cfg_var] = str(config_path)

    yield start

    # Restore the config env variable's setting. Probably unnecessary.
    if config_before is None:
        del environ[cfg_var]
    else:
        environ[cfg_var] = config_before


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
