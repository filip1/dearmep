from typing import Any, Callable, Dict, Iterable, Optional

from fastapi import APIRouter, Depends, HTTPException, Header, Query, \
    Response, status
from prometheus_client import Counter
from typing_extensions import Annotated

from ..config import Config, Language, all_frontend_strings
from ..database.connection import Session, get_session
from ..database.models import Blob, DestinationID, DestinationRead
from ..database import query
from ..l10n import find_preferred_language, get_country, parse_accept_language
from ..models import MAX_SEARCH_RESULT_LIMIT, CountryCode, \
    DestinationSearchResult, FrontendStringsResponse, LanguageDetection, \
    LocalizationResponse, RateLimitResponse, SearchResult, SearchResultLimit
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


BlobURLDep = Callable[[Optional[Blob]], Optional[str]]


def blob_path(blob: Optional[Blob]) -> Optional[str]:
    # FIXME: This should not be hardcoded.
    return None if blob is None else f"/api/v1/blob/{blob.name}"


def blob_url() -> Iterable[BlobURLDep]:
    """Dependency to convert a Blob to a corresponding API request path."""
    yield blob_path


def session():
    """Dependency to get an SQLAlchemy session."""
    with get_session() as s:
        yield s


router = APIRouter()


@router.get(
    "/localization", operation_id="getLocalization",
    response_model=LocalizationResponse,
    # TODO: This explicit limit here makes little sense, it's more of a demo.
    dependencies=[Depends(Limit("5/minute"))],
    responses=rate_limit_response,  # type: ignore[arg-type]
)
def get_localization(
    session: Annotated[Session, Depends(session)],
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

    location = get_country(session, geo_db, client_addr)

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
    "/frontend-strings/{language}", operation_id="getFrontendStrings",
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
    "/blob/{name}", operation_id="getBlob",
    response_class=Response,
    responses={
        200: {
            "content": {"application/octet-stream": {}},
            "description": "The contents of the named blob, with a matching "
                           "mimetype set.",
        },
    },
)
def get_blob_contents(
    name: str,
    session: Annotated[Session, Depends(session)],
):
    """
    Returns the contents of a blob, e.g. an image or audio file.
    """
    try:
        blob = query.get_blob_by_name(session, name)
    except query.NotFound as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    return Response(blob.data, media_type=blob.mime_type)


@router.get(
    "/destinations/country/{country}", operation_id="getDestinationsByCountry",
    response_model=SearchResult[DestinationSearchResult],
)
def get_destinations_by_country(
    session: Annotated[Session, Depends(session)],
    country: CountryCode,
) -> SearchResult[DestinationSearchResult]:
    """Return all destinations in a given country."""
    dests = query.get_destinations_by_country(session, country)
    return query.to_destination_search_result(dests, blob_path)


@router.get(
    "/destinations/name", operation_id="getDestinationsByName",
    response_model=SearchResult[DestinationSearchResult],
)
def get_destinations_by_name(
    session: Annotated[Session, Depends(session)],
    name: str = Query(
        description="The (part of the) name to search for.",
        example="miers",
    ),
    all_countries: bool = Query(
        True,
        description="Whether to only search in the country specified by "
        "`country`, or in all countries. If `true`, and `country` is "
        "provided, Destinations from that country will be listed first.",
    ),
    country: Optional[CountryCode] = Query(
        None,
        description="The country to search in (if `all_countries` is false) "
        "or prefer (if `all_countries` is true). Has to be specified if "
        "`all_countries` is false.",
        example="DE",
    ),
    limit: SearchResultLimit = Query(
        MAX_SEARCH_RESULT_LIMIT,
        description="Maximum number of results to be returned.",
        example=MAX_SEARCH_RESULT_LIMIT,
    ),
) -> SearchResult[DestinationSearchResult]:
    """Return Destinations by searching for (parts of) their name."""
    if not all_countries and country is None:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="country is required if all_countries is false",
        )
    dests = query.get_destinations_by_name(
        session, name,
        all_countries=all_countries,
        country=country,
        limit=limit,
    )
    return query.to_destination_search_result(dests, blob_path)


@router.get(
    "/destinations/id/{id}", operation_id="getDestinationByID",
    response_model=DestinationRead,
)
def get_destination_by_id(
    session: Annotated[Session, Depends(session)],
    blob_url: Annotated[BlobURLDep, Depends(blob_url)],
    id: DestinationID,
) -> DestinationRead:
    try:
        dest = query.get_destination_by_id(session, id)
    except query.NotFound as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    dest_r = DestinationRead.from_orm(dest, {
        "portrait": blob_url(dest.portrait),
    })
    return dest_r


@router.get(
    "/destinations/suggested", operation_id="getSuggestedDestination",
    response_model=DestinationRead,
)
def get_suggested_destination(
    session: Annotated[Session, Depends(session)],
    blob_url: Annotated[BlobURLDep, Depends(blob_url)],
    country: Optional[CountryCode] = None,
):
    """
    Return a suggested destination to contact, possibly limited by country.
    """
    try:
        # TODO: Replace with actually _recommended_, not random.
        dest = query.get_random_destination(session, country=country)
    except query.NotFound as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    dest_r = DestinationRead.from_orm(dest, {
        "portrait": blob_url(dest.portrait),
    })
    return dest_r
