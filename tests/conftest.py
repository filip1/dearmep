from os import environ
from pathlib import Path
from fastapi.testclient import TestClient

import pytest

from callament.main import start


environ["CALLAMENT_CONFIG"] = str(Path(
    Path(__file__).parent.parent, "example-config.yaml"))
app = start()


@pytest.fixture
def client():
    yield TestClient(app)
