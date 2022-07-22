from fastapi.testclient import TestClient

import pytest

from callament.main import app


@pytest.fixture
def client():
    yield TestClient(app)
