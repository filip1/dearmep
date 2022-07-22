from fastapi.testclient import TestClient


def test_constraints(client: TestClient):
    res = client.get("/constraints")
    assert res.status_code == 200
    assert "schedules" in res.json()
