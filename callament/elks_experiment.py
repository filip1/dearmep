from os import environ

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .phone import elks


app = FastAPI(
    title="Callament 46elks Experiment",
)


elks.include_router(
    app,
    base_url=environ["BASE_URL"],
    allow_localhost=bool(environ.get("ALLOW_LOCALHOST", "")),
)


app.mount("/audio", StaticFiles(directory="audio"), name="audio")


@app.get("/")
async def root():
    return {"hello": "world"}
