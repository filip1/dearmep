# DearMEP

## Installation for Development

1. Install [Poetry](https://python-poetry.org/).
2. Run `poetry install`.
3. Done.

## Providing a Configuration File

Please set the environment variable `DEARMEP_CONFIG` (which defaults to `config.yaml`) to the name of a YAML file containing the configuration.
See [`example-config.yaml`](example-config.yaml) for an example.

## Running a Development Server

```sh
poetry run uvicorn --log-level debug --log-config logging.yaml --reload --factory dearmep.main:start
```

## Retrieving the OpenAPI specification

A running DearMEP server will provide its OpenAPI specification at `/openapi.json` and GUIs for it at `/docs` and `/redoc`.

To quickly dump the OpenAPI spec to stdout, use `poetry run dearmep-openapi-spec`.
