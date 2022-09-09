from fastapi import FastAPI

from . import __version__


app = FastAPI(
    title="Callament",
    version=__version__,
)
