from typing import Iterable

from fastapi import status
from fastapi.testclient import TestClient
import pytest

from conftest import fastapi_factory_func


# If we initialize the Prometheus instrumentator more than once, it will create
# duplicate timeseries, which is not allowed. Therefore, we only get to call
# this once.
@pytest.fixture(scope="session")
def prom_client():
    # We can't simply use the fastapi_factory fixture because its scope is
    # per-function, not per-session.
    with fastapi_factory_func() as start:
        client = TestClient(start())

    with client as client_with_events:
        # The `with` causes `@app.on_event("startup")` code to run.
        # <https://fastapi.tiangolo.com/advanced/testing-events/>
        yield client_with_events


def metrics_lines_func(prom_client: TestClient) -> Iterable[str]:
    res = prom_client.get("/metrics")
    assert res.status_code == status.HTTP_200_OK
    for line in res.iter_lines(decode_unicode=True):
        yield str(line)


@pytest.fixture
def metrics_lines(prom_client: TestClient):
    yield list(metrics_lines_func(prom_client))


def test_python_info_in_metrics(metrics_lines: Iterable[str]):
    assert [
        line
        for line in metrics_lines
        if line.startswith("python_info{")
        and line.endswith(" 1.0")
    ]


def test_non_grouped_status_codes(prom_client: TestClient):
    # Do a throwaway request in order to have at least one request in the
    # metrics when doing the actual test.
    assert prom_client.get("/metrics").status_code == status.HTTP_200_OK

    mark = 'http_requests_total{handler="/metrics",method="GET",status="200"} '
    assert [
        line
        for line in metrics_lines_func(prom_client)
        if line.startswith(mark)
    ]
