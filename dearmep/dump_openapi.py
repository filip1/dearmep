import asyncio
import logging
from logging.config import dictConfig
from os import environ
from pathlib import Path
from time import monotonic

import httpx
import uvicorn


_logger = logging.getLogger(__name__)


LOG_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "uvicorn": {
            "format": "%(asctime)s %(levelprefix)s [%(name)s]  %(message)s",
            "class": "uvicorn.logging.DefaultFormatter",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stderr",
            "formatter": "uvicorn",
        },
    },
    "root": {
        "level": "DEBUG",
        "handlers": ["console"],
    },
}


def create_server(port: int) -> uvicorn.Server:
    top = Path(__file__).parent.parent
    environ.setdefault("DEARMEP_CONFIG",
                       str(Path(top, "dearmep", "example-config.yaml")))
    config = uvicorn.Config(
        "dearmep.main:start",
        factory=True,
        port=port,
        log_config=LOG_CONFIG,
    )
    return uvicorn.Server(config)


async def run_server(server: uvicorn.Server):
    asyncio.create_task(server.serve())


async def get_spec(port: int, timeout: int = 10) -> str:
    deadline = monotonic() + timeout
    async with httpx.AsyncClient(timeout=1) as client:
        while monotonic() < deadline:
            try:
                res = await client.get(f"http://localhost:{port}/openapi.json")
                return res.text
            except httpx.TransportError:
                pass  # Retry, maybe the server is still starting up.
            await asyncio.sleep(0.1)
    raise Exception(f"timeout, could not fetch OpenAPI in {timeout} second(s)")


async def main(*, port: int):
    _logger.debug("creating Uvicorn server")
    server = create_server(port)
    _logger.debug("starting the server in the background")
    asyncio.create_task(run_server(server))
    _logger.info("trying to fetch OpenAPI JSON...")
    spec = await get_spec(port)
    print(spec)
    _logger.debug("shutting down Uvicorn again")
    await server.shutdown()


def cli():
    from argparse import ArgumentParser

    dictConfig(LOG_CONFIG)
    default_port = 12323

    parser = ArgumentParser(
        description="Dump OpenAPI spec in JSON format to stdout by running a "
        "temporary API server and querying its /openapi.json endpoint."
    )

    parser.add_argument(
        "--port", "-p",
        type=int, default=int(environ.get("DEARMEP_PORT", default_port)),
        help="the port on which to run the temporary API server; defauts to "
        f"$DEARMEP_PORT (if it exists) or {default_port}",
    )

    args = parser.parse_args()

    asyncio.run(main(
        port=args.port,
    ))


if __name__ == "__main__":
    cli()
