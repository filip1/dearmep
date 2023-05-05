from typing import Iterable

from fastapi import status
from fastapi.testclient import TestClient
import pytest

from dearmep.config import APP_NAME


def metrics_lines_func(client: TestClient) -> Iterable[str]:
    res = client.get("/metrics")
    assert res.status_code == status.HTTP_200_OK
    for line in res.iter_lines():
        yield str(line).rstrip("\r\n")


@pytest.fixture
def metrics_lines(client: TestClient):
    yield list(metrics_lines_func(client))


def test_python_info_in_metrics(metrics_lines: Iterable[str]):
    assert [
        line
        for line in metrics_lines
        if line.startswith("python_info{")
        and line.endswith(" 1.0")
    ]


def test_non_grouped_status_codes(client: TestClient):
    # Do a throwaway request in order to have at least one request in the
    # metrics when doing the actual test.
    assert client.get("/metrics").status_code == status.HTTP_200_OK

    mark = f'starlette_requests_total{{app_name="{APP_NAME}",method="GET",' \
        + 'path="/metrics",status_code="200"} '
    assert [
        line
        for line in metrics_lines_func(client)
        if line.startswith(mark)
    ]
