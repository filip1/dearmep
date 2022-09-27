from typing import Any, List, Optional

from pydantic import BaseModel, ConstrainedStr, Field


class CountryCode(ConstrainedStr):
    """An ISO-639 country code."""
    min_length = 2
    max_length = 3


class LanguageDetection(BaseModel):
    available: List[str] = Field(
        ...,
        description="The list of languages supported by the server.",
        example=["en-GB", "fr-FR", "de"],
    )
    recommended: str = Field(
        ...,
        description="Which of the available languages best matches the user's "
                    "preferences",
        example="en-GB",
    )
    user_preferences: List[str] = Field(
        ...,
        description="The preferences stated by the user, as recognized by the "
                    "server, e.g. via parsing the `Accept-Language` header.",
        example=["en-US", "en", "tlh"],
    )


class LocationDetection(BaseModel):
    available: List[CountryCode] = Field(
        ...,
        description="The list of countries supported by the server.",
        example=["at", "be", "uk"],
    )
    country: Optional[CountryCode] = Field(
        None,
        description="The ISO code of the country the user most likely "
                    "currently is in.",
        example="be",
    )
    db_result: Any = Field(
        None,
        title="DB Result",
        description="The raw geo database lookup result, mainly for debugging "
                    "purposes.",
        example={"country": "be"},
    )
    ip_address: Optional[str] = Field(
        None,
        title="IP Address",
        description="The client's IP address that has been looked up in the "
                    "location database. Can be IPv4 or IPv6.",
        example="123.123.123.123",
    )


class LocalizationResponse(BaseModel):
    language: LanguageDetection = Field(
        ...,
        description="Information about the available and recommended "
                    "languages.",
    )
    location: LocationDetection = Field(
        ...,
        description="Information about the probable physical location.",
    )
