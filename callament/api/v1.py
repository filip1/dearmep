from fastapi import APIRouter, Header

from ..l10n import find_preferred_language, parse_accept_language
from ..models import LanguageDetection, LocalizationResponse


router = APIRouter()


@router.get(
    "/localization",
    response_model=LocalizationResponse,
)
def localize(accept_language: str = Header("")):
    # TODO: Read from config.
    available_languages = ["en-gb", "fr-fr", "de-de"]

    preferences = parse_accept_language(accept_language)
    return LocalizationResponse(
        language=LanguageDetection(
            available=available_languages,
            recommended=find_preferred_language(
                prefs=preferences,
                available=available_languages,
                fallback=available_languages[0],
            ),
            user_preferences=preferences,
        )
    )
