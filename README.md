# Callament

## Installation for Development

1. Install [Poetry](https://python-poetry.org/).
2. Run `poetry install`.
3. Done.

## Running a Development Server

```sh
poetry run uvicorn --log-level debug --log-config logging.yaml --reload callament.main:app
```
