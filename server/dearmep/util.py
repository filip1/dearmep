from time import time

from fastapi import HTTPException, Request, routing, status
import limits
from prometheus_client import Counter


# The storage is implemented in `limits` with a weak reference, therefore we
# need to keep a reference here.
limits_storage = limits.storage.MemoryStorage()
moving_window = limits.strategies.MovingWindowRateLimiter(limits_storage)


http_ratelimit_total = Counter(
    "http_ratelimit_total",
    "Number of times a rate limit was passed or hit, by endpoint/method.",
    ("method", "path", "result"),
)


def client_addr(request: Request) -> str:
    """Retrieve the client's IP address.

    This can be used as a dependency, mainly to enable swapping it out while
    running the test suite.
    """
    # Always return a string. If we don't know the client's host, return a
    # string nevertheless.
    return request.client.host if request.client else ""


class Limit:
    """Dependency for rate limiting calls of an endpoint."""

    @staticmethod
    def reset_all_limits():
        limits_storage.reset()

    def __init__(self, limit: str):
        self.limit = limits.parse(limit)

    def __call__(self, request: Request):
        route: routing.APIRoute = request.scope["route"]
        prom_labels = (request.method, route.path)
        # FIXME: Make this more clever (whole /64?) when dealing with IPv6.
        identifiers = (client_addr(request),)
        reset_at = moving_window.get_window_stats(self.limit, *identifiers)[0]

        if moving_window.hit(self.limit, *identifiers):
            # Within the limit. Do nothing, except counting it.
            http_ratelimit_total.labels(*prom_labels, "pass").inc()
            return

        # Limit exceeded.
        http_ratelimit_total.labels(*prom_labels, "hit").inc()
        reset_in = max(1, round(reset_at - time()))
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            f"rate limit exceeded, try again in {reset_in} "
            f"second{'' if reset_in == 1 else 's'}",
            headers={"Retry-After": str(reset_in)},
        )
