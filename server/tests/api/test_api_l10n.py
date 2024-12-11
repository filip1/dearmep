# SPDX-FileCopyrightText: © 2022 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from fastapi import FastAPI, status
from fastapi.testclient import TestClient

from dearmep.ratelimit import client_addr


def override_client_addr(app: FastAPI, ip_addr: str):
    """Set a custom source IP to get a defined geo IP result."""
    app.dependency_overrides = {
        client_addr: lambda: ip_addr,
    }


def test_l10n(
    fastapi_app: FastAPI,
    client: TestClient,
    with_example_destinations,
):
    override_client_addr(fastapi_app, "2a01:4f8::1")
    res = client.get(
        "/api/v1/frontend-setup",
        headers={
            "Accept-Language": "tlh;q=1, en;q=0.8",
        },
    )
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert isinstance(data, dict)

    assert "language" in data
    language = data["language"]
    assert isinstance(language, dict)

    assert "available" in language
    assert isinstance(language["available"], list)
    assert len(language["available"]) > 0
    for la in language["available"]:
        assert isinstance(la, str)
    assert "tlh" not in language["available"]

    assert "user_preferences" in language
    assert isinstance(language["user_preferences"], list)
    assert language["user_preferences"] == ["tlh", "en"]

    assert "recommended" in language
    assert language["recommended"].startswith("en")

    assert "location" in data
    location = data["location"]
    assert isinstance(location, dict)

    assert "available" in location
    assert location["available"] == ["AT", "DE"]
    assert "country" in location
    assert location["country"] == "DE"
    assert "recommended" in location
    assert location["recommended"] == "DE"
    assert "ip_address" in location
    assert location["ip_address"] == "2a01:4f8::1"
    assert "db_result" in location
    assert location["db_result"] == {"country": {"iso_code": "de"}}


def test_l10n_without_addr_override(client: TestClient):
    # Do a request without overriding the address, mainly for coverage of the
    # real address dependable.
    res = client.get("/api/v1/frontend-setup")
    assert res.status_code == status.HTTP_200_OK


def test_l10n_ratelimit(fastapi_app: FastAPI, client: TestClient):
    override_client_addr(fastapi_app, "2a01:abc::1")
    for _ in range(5):
        res = client.get("/api/v1/frontend-setup")
        assert res.status_code == status.HTTP_200_OK
    res = client.get("/api/v1/frontend-setup")
    assert res.status_code == status.HTTP_429_TOO_MANY_REQUESTS


def test_l10n_ratelimit_v6(fastapi_app: FastAPI, client: TestClient):
    # Default limit is 5 per second, so we'll change IP addresses every 5
    # requests. However, once we've done 100 in total, we'll be rated-limited
    # via our /64.
    for i in range(100):
        if i % 5 == 0:
            new_addr = f"2a01:abc::{i // 5 + 1}"
            override_client_addr(fastapi_app, new_addr)
        res = client.get("/api/v1/frontend-setup")
        assert res.status_code == status.HTTP_200_OK
    res = client.get("/api/v1/frontend-setup")
    assert res.status_code == status.HTTP_429_TOO_MANY_REQUESTS
    # With a different /64 it should still work though.
    override_client_addr(fastapi_app, "2a01:abc:0:1::1")
    res = client.get("/api/v1/frontend-setup")
    assert res.status_code == status.HTTP_200_OK
