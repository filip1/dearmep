from fastapi import status
from fastapi.testclient import TestClient


def test_l10n(client: TestClient):
    res = client.get(
        "/api/v1/localization",
        headers={
            "Accept-Language": "tlh;q=1, en;q=0.8",
        }
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
