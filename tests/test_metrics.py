from typing import Iterable
from fastapi.testclient import TestClient


def metrics_lines(client: TestClient) -> Iterable[str]:
    for line in client.get("/metrics").iter_lines(decode_unicode=True):
        yield str(line)


def test_python_info_in_metrics(client: TestClient):
    assert [
        line.startswith("python_info{")
        and line.endswith(" 1.0")
        for line in metrics_lines(client)
    ]


def test_non_grouped_status_codes(client: TestClient):
    # Do a throwaway request in order to have at least one request in the
    # metrics when doing the actual test.
    next(iter(metrics_lines(client)))

    mark = 'http_requests_total{handler="/metrics",method="GET",status="200"} '
    assert [
        line.startswith(mark)
        for line in metrics_lines(client)
    ]
