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

## Serving Static Files (e.g. the Client)

If you set the environment variable `DEARMEP_STATIC_FILES_DIR` to a directory path, DearMEP will provide the contents of that directory at the HTTP root.
This can be used to serve the JavaScript, CSS and assets of the client snippet.
There are no directory indexes and there is no `index.html` support.

Even if you use this feature, you are still expected to run a reverse proxy server for additional stability.
Also, while the static files will be served with `Last-Modified` and `eTag` headers, there is no `Cache-Control`; you should configure this in the reverse proxy.

If you set `DEARMEP_DEMO_PAGE=y`, a basic demo HTML page will be returned at the HTTP root.
This option only has an effect if you have also configured `DEARMEP_STATIC_FILES_DIR`.

## Retrieving the OpenAPI specification

A running DearMEP server will provide its OpenAPI specification at `/openapi.json` and GUIs for it at `/docs` and `/redoc`.

To quickly dump the OpenAPI spec to stdout, use `poetry run dearmep-openapi-spec`.
