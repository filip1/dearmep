# DearMEP

## Installation for Development

1. Install [Poetry](https://python-poetry.org/).
2. Clone this repository and `cd` into it.
3. Run `poetry install`.
4. Done.

Poetry takes care of managing a [virtual environment](https://docs.python.org/3/tutorial/venv.html) for you, containing DearMEP and all of its dependencies, without messing with your global installation.
You can use `poetry shell` to launch a new subshell with your `$PATH` modified to use the virtual environment.
Alternatively, you can prefix individual commands with `poetry run` to run just that command inside of the virtual environment.

**In the examples below, commands like `dearmep` or `uvicorn` should either be run inside of a `poetry shell`, or prefixed like `poetry run dearmep`.**

## Providing a Configuration File

Please set the environment variable `DEARMEP_CONFIG` (which defaults to `config.yaml`) to the name of a YAML file containing the configuration.
See [`example-config.yaml`](dearmep/example-config.yaml) for an example.

## Running a Development Server

```sh
dearmep serve --log-level debug --reload
```

You can modify the port with `-p 1234`.
See `dearmep serve --help` for other options, including how to start it via a separate ASGI server.

## Serving Static Files (e.g. the Client)

If you set the environment variable `DEARMEP_STATIC_FILES_DIR` to a directory path, DearMEP will provide the contents of that directory at `/static/`.
This can be used to serve the JavaScript, CSS and assets of the client snippet.
There are no directory indexes and there is no `index.html` support.

Pre-built releases of DearMEP come bundled with a client snippet (in `dearmep/static_files/static`), and their `DEARMEP_STATIC_FILES_DIR` will default to that bundled snippet.
(Set the environment variable to an empty string to disable the bundled snippet.)

Even if you use this feature, you are still expected to run a reverse proxy server for additional stability.
Also, while the static files will be served with `Last-Modified` and `ETag` headers, there is no `Cache-Control` header; you should configure this in the reverse proxy.

If you set `DEARMEP_DEMO_PAGE=y`, a basic demo HTML page will be returned at the HTTP root.
This option only has an effect if you have also configured `DEARMEP_STATIC_FILES_DIR` (or you are using a bundled snippet).

## Retrieving the OpenAPI specification

A running DearMEP server will provide its OpenAPI specification at `/openapi.json` and GUIs for it at `/docs` and `/redoc`.

To quickly dump the OpenAPI spec to stdout, use `dearmep dump openapi`.

## Running Behind a Reverse Proxy

If you run DearMEP behind a reverse proxy like [Caddy](https://caddyserver.com/), [nginx](https://nginx.org/) or [Træfik](https://traefik.io/traefik/), make sure to provide the remote client’s original IP address via the `X-Forwarded-For` header.
This is required for the geolocation to work.

For nginx, and if you’re using `dearmep serve`, check out [Uvicorn’s best practices](https://www.uvicorn.org/deployment/#running-behind-nginx).
`dearmep serve` currently doesn’t support listening to a Unix domain socket, so please use a normal TCP HTTP connection instead (e.g. `proxy_pass http://localhost:8000/;`).
