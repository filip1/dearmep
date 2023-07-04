from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Header, Query, \
    Response, status
from prometheus_client import Counter
from typing_extensions import Annotated

from ..config import Config, Language, all_frontend_strings
from ..database.connection import NoResultFound, Session, get_session, select
from ..database.models import Blob
from ..l10n import find_preferred_language, get_country, parse_accept_language
from ..models import FrontendStringsResponse, LanguageDetection, \
    LocalizationResponse, RateLimitResponse
from ..util import Limit, client_addr


l10n_autodetect_total = Counter(
    "l10n_autodetect_total",
    "Number of times language/country autodetect was performed, by results.",
    ("language", "country"),
)


rate_limit_response: Dict[int, Dict[str, Any]] = {
    429: {
        "description": "Rate Limit Exceeded",
        "model": RateLimitResponse,
        "headers": {
            "Retry-After": {
                "description": "The number of seconds until the limit resets.",
                "schema": {"type": "integer"},
            },
        },
    },
}


def session():
    with get_session() as s:
        yield s


router = APIRouter()


@router.get(
    "/localization",
    response_model=LocalizationResponse,
    # TODO: This explicit limit here makes little sense, it's more of a demo.
    dependencies=[Depends(Limit("5/minute"))],
    responses=rate_limit_response,  # type: ignore[arg-type]
)
def localize(
    frontend_strings: bool = Query(
        False,
        description="Whether to also include all frontend translation strings "
        "for the detected language. If you don’t request this, the "
        "`frontend_strings` field in the response will be `null` to save "
        "bandwidth.",
    ),
    client_addr: str = Depends(client_addr),
    accept_language: str = Header(""),
):
    """
    Based on the user’s IP address and `Accept-Language` header, suggest a
    country and language from the ones available in the campaign.
    """
    l10n_config = Config.get().l10n
    available_languages = l10n_config.languages
    default_language = l10n_config.default_language
    geo_db = l10n_config.geo_mmdb

    preferences = parse_accept_language(accept_language)
    recommended_lang = find_preferred_language(
                prefs=preferences,
                available=available_languages,
                fallback=default_language,
            )

    location = get_country(geo_db, client_addr)

    # Track localization results in Prometheus.
    l10n_autodetect_total.labels(
        recommended_lang, str(location.country)
    ).inc()

    return LocalizationResponse(
        language=LanguageDetection(
            available=available_languages,
            recommended=recommended_lang,
            user_preferences=preferences,
        ),
        location=location,
        frontend_strings=all_frontend_strings(recommended_lang)
        if frontend_strings else None,
    )


# TODO: Add caching headers, this is pretty static data.
@router.get(
    "/frontend-strings/{language}",
    response_model=FrontendStringsResponse,
    responses=rate_limit_response,  # type: ignore[arg-type]
)
def get_frontend_strings(
    language: Language,
):
    """
    Returns a list of translation strings, for the given language, to be used
    by the frontend code. If a string is not available in that language, it
    will be returned in the default language instead. All strings that exist
    in the config's `frontend_strings` section are guaranteed to be available
    at least in the default language.
    """
    return FrontendStringsResponse(
        frontend_strings=all_frontend_strings(language),
    )


# TODO: Add caching headers.
@router.get(
    "/blob/{name}",
)
def get_blob_contents(
    name: str,
    session: Annotated[Session, Depends(session)],
):
    """
    Returns the contents of a blob, e.g. an image or audio file.
    """
    try:
        blob = session.exec(select(Blob).where(Blob.name == name)).one()
    except NoResultFound:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "no blob with that name",
        )
    return Response(blob.data, media_type=blob.mime_type)
