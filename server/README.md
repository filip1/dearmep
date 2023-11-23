# DearMEP

## Installation for Development

1. Install [Poetry](https://python-poetry.org/).
2. Clone this repository and `cd` into it.
3. Run `poetry install --all-extras`.
  * See below on which extras this will install. Alternatively, you can select individual extras with `--extras NAME` or don’t install any extras at all.
4. Done.

Poetry takes care of managing a [virtual environment](https://docs.python.org/3/tutorial/venv.html) for you, containing DearMEP and all of its dependencies, without messing with your global installation.
You can use `poetry shell` to launch a new subshell with your `$PATH` modified to use the virtual environment.
Alternatively, you can prefix individual commands with `poetry run` to run just that command inside of the virtual environment.

**In the examples below, commands like `dearmep` or `uvicorn` should either be run inside of a `poetry shell`, or prefixed like `poetry run dearmep`.**

## Extras

Python packages can have optional dependencies, called _extras_.
These can provide additional, optional features.
DearMEP defines the following extras:

* `convert`: Additional tools for converting different data formats into each other, or general data manipulation. Can be very helpful for importing & exporting data like MEPs, statistics or swayability scores into and out of DearMEP. Will install [csvkit](https://csvkit.readthedocs.io/) and [VisiData](https://visidata.org/).
* `specs`: Dependencies for extended specifications & documentation. Right now, this is just [eralchemy2](https://github.com/maurerle/eralchemy2) to generate entity relationship diagrams using `dearmep dump erd`.

## Providing a Configuration File

Please set the environment variable `DEARMEP_CONFIG` (which defaults to `config.yaml`) to the name of a YAML file containing the configuration.
See [`example-config.yaml`](dearmep/example-config.yaml) for an example.

## Alembic

DearMEP is using [Alembic](https://alembic.sqlalchemy.org/) to manage the database and perform version upgrades to it.
Currently, this is a manual process.

### For Users

If you upgrade, make sure to `alembic upgrade head`. You can downgrade the database via `alembic downgrade $REVISION`

### For Developers

If you change the models which are reflected in the database, you'll need to do use Alembic to handle database migrations. You can create migrations via

```sh
alembic revision --autogenerate --message "your short alembic message about the reason of this migration"
```

Alembic generates a file in `migrations/versions/`. **Check this file** for sanity. You can edit or delete this file though this usually should not be necessary. If you are happy about the migration, commit to version control.

Make sure to `upgrade` the database to the latest revision when developing. It is recommended to check the upgrades first, for example by making a copy of the the database source and changing the `sqlalchemy.uri` in the `alembic.ini` or by checking the raw SQL with the `--sql` flag.

Please check [Alembic's documentation](https://alembic.sqlalchemy.org/en/latest/) for more.

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

## Serving Markdown Files

In addition to static files, as described in the previous section, DearMEP can also render and serve Markdown files, in multiple languages, with simple templating support.
This can for example be used to serve a privacy policy or other simple documents.

To use this feature, set the environment variable `DEARMEP_MARKDOWN_FILES_DIR` to a directory path.
This directory will need to contain the following structure:

```
docs
| `- privacy  (1)
|    | `- en.md
|    |    de.md
|    |    …
|    another_folder  (1)
|      `- en.md
|         de.md
|         …
static
| `- styles.css
|    …
templates
  `- default.html.jinja
```

The folders marked `(1)` can have any name.
However, they have to contain Markdown files named `{language}.md`, where `{language}` is one of the configured languages of the instance.
These documents will then be served at `/pages/{folder_name}/{language}/` (including the trailing slash).

The files in the `static` directory will be available at `/pages/{path}`, e.g. `/pages/styles.css`.
Subdirectories below `static` will be ignored, in order to prevent ambiguousness with Markdown documents.

The `templates` directory needs to contain a file named `default.html.jinja` with a [Jinja2](https://jinja.palletsprojects.com/) HTML template.
The Markdown documents will be passed to this document in a `content` variable.
Additional available variables are:

* `title`: The first level-1 heading of the Markdown document, useful for placing in an HTML `<title>` element.
* `base_path`: Usually `/pages/`. Should be used as a prefix to refer to files in `static`, e.g. the stylesheet.
* `language`: The `{language}` part of the URL, can be used for setting `<html lang="…">`.

**Note:**
The generated HTML is cached in memory.
If you modify the document or the Jinja template after its initial render, these modifications will not show up in the HTML output until DearMEP is restarted.

## Retrieving the OpenAPI specification

A running DearMEP server will provide its OpenAPI specification at `/openapi.json` and GUIs for it at `/docs` and `/redoc`.

To quickly dump the OpenAPI spec to stdout, use `dearmep dump openapi`.

## Running Behind a Reverse Proxy

If you run DearMEP behind a reverse proxy like [Caddy](https://caddyserver.com/), [nginx](https://nginx.org/) or [Træfik](https://traefik.io/traefik/), make sure to provide the remote client’s original IP address via the `X-Forwarded-For` header.
This is required for the geolocation to work.

For nginx, and if you’re using `dearmep serve`, check out [Uvicorn’s best practices](https://www.uvicorn.org/deployment/#running-behind-nginx).
`dearmep serve` currently doesn’t support listening to a Unix domain socket, so please use a normal TCP HTTP connection instead (e.g. `proxy_pass http://localhost:8000/;`).
