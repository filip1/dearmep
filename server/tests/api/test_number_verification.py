# SPDX-FileCopyrightText: © 2025 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from fastapi import status
from fastapi.testclient import TestClient


def test_invalid_number(client: TestClient):
    res = client.post(
        "/api/v1/number-verification/request",
        json={"language": "de", "accepted_dpp": True, "phone_number": "+44 1"},
    )
    assert res.status_code == status.HTTP_400_BAD_REQUEST
    data = res.json()
    assert data == {"errors": ["INVALID_PATTERN"]}
