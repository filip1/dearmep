from os import environ
from pathlib import Path
from fastapi import FastAPI
from fastapi.testclient import TestClient

import pytest

from callament.config import Config
from callament.main import start


@pytest.fixture
def fastapi_app():
    tests_dir = Path(__file__).parent
    top_dir = tests_dir.parent

    # Point to the example config file.
    cfg_var = "CALLAMENT_CONFIG"
    config_before = environ.get(cfg_var)
    environ[cfg_var] = str(Path(top_dir, "example-config.yaml"))

    app = start()
    config = Config.get()

    # Change the MMDB to point to the test one.
    geo_mmdb_before = config.l10n.geo_mmdb
    config.l10n.geo_mmdb = Path(tests_dir, "geo_ip", "test.mmdb")

    yield app

    # Restore the MMDB setting.
    config.l10n.geo_mmdb = geo_mmdb_before

    # Restore the config env variable's setting. Probably unnecessary.
    if config_before is None:
        del environ[cfg_var]
    else:
        environ[cfg_var] = config_before


@pytest.fixture
def client(fastapi_app: FastAPI):
    yield TestClient(fastapi_app)
