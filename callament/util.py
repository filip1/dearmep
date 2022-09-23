from fastapi import Request


def client_addr(request: Request) -> str:
    """Retrieve the client's IP address.

    This can be used as a dependency, mainly to enable swapping it out while
    running the test suite.
    """
    # Always return a string. If we don't know the client's host, return a
    # string nevertheless.
    return request.client.host if request.client else ""
