from typing import List

from pydantic import BaseModel, Field


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


class LocalizationResponse(BaseModel):
    language: LanguageDetection = Field(
        ...,
        description="Information about the available and recommended "
                    "languages.",
    )
