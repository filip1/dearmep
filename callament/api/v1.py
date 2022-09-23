from os import environ
from fastapi import APIRouter, Header, Request

from ..l10n import find_preferred_language, get_country, parse_accept_language
from ..models import LanguageDetection, LocalizationResponse


router = APIRouter()


@router.get(
    "/localization",
    response_model=LocalizationResponse,
)
def localize(request: Request, accept_language: str = Header("")):
    # TODO: Read from config.
    available_languages = ["en-gb", "fr-fr", "de-de"]
    geo_db = environ.get("GEO_DB", "")

    preferences = parse_accept_language(accept_language)

    location = get_country(
        geo_db,
        # If we don't have a client IP, we can't give it to the lookup code.
        request.client.host if request.client else "",
    )

    return LocalizationResponse(
        language=LanguageDetection(
            available=available_languages,
            recommended=find_preferred_language(
                prefs=preferences,
                available=available_languages,
                fallback=available_languages[0],
            ),
            user_preferences=preferences,
        ),
        location=location,
    )
