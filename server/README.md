<!--
SPDX-FileCopyrightText: © 2022 Tim Weber
SPDX-FileCopyrightText: © 2023 iameru

SPDX-License-Identifier: AGPL-3.0-or-later
-->

# DearMEP Server

This is the server side of DearMEP.
It provides a RESTful API and employs

* [FastAPI](https://fastapi.tiangolo.com/) as its application framework,
* [SQLite](https://www.sqlite.org/) as its zero-maintenance, self-contained database,
* [SQLAlchemy](https://www.sqlalchemy.org/) for accessing that database,
* [ffmpeg](https://ffmpeg.org/) for converting audio,

as well as several other libraries to do its job.

## Features

* [Pydantic](https://docs.pydantic.dev/1.10/)-powered rigorous validation of user-supplied data
* Fully configurable rate limiting and telephony subsystem to protect against malicious users and manage spending
* [Prometheus metrics](../doc/metrics.md) to observe the system's health
* Convenient command line interface and composable import and export tools
* Privacy-first design, keeping information stored about users to a minimum

## Installation

DearMEP is not yet available on PyPI.
For now, please install it "for development", as described below.

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
* `specs`: Dependencies for extended specifications & documentation. Right now, this is just [eralchemy2](https://github.com/maurerle/eralchemy2) to generate entity relationship diagrams using `dearmep dump erd`. You probably don't need this.

## Command Line Interface

If you have installed DearMEP correctly, you will have access to the `dearmep` command in your shell.
It provides several subcommands to interact with your DearMEP installation or help you convert data.

Like any good command line tool, it comes with a `--help` argument that will show you all available commands and options.
Use `--help` with a subcommand to get more information about that subcommand, e.g. `dearmep dump --help`.

The most accurate documentation about the command line interface is always what `--help` gives you, but here is a small overview of the subcommands:

* `serve`: Start an HTTP server that provides the actual DearMEP API.
* `convert`: Several tools to convert data into into formats that DearMEP can use, or intermediate formats for further manipulation.
* `import`: Import Destinations (people to contact, e.g. MEPs) or scoring information into the database.
* `db`: Check the database for issues, add files to the blob storage.
* `dump`: Print example configuration files and specifications.
* `version`: Print the version numbers of Python, DearMEP, and its most important libraries.
* `check`: Run checks against your configuration, e.g. whether all strings are translated in all languages.

## Providing a Configuration File

Please set the environment variable `DEARMEP_CONFIG` (which defaults to `config.yaml`) to the name of a YAML file containing the configuration.
See [`example-config.yaml`](dearmep/example-config.yaml) for an extensively commented example.

You can use `dearmep dump example-config` to produce a config file, which you can then modify according to your needs.

## Providing MEPs & Scoring

DearMEP does not come with a built-in list of Members of Parliament.
That list would change quite often, and you might only want to offer your users a subset of them, or an entirely different group of people and not MEPs at all.
(For that reason, we often call them _Destinations_ instead, i.e. people that can be called. For more on some of our special terms, please see the [glossary](../doc/glossary.md).)

Also, one of DearMEP's key features is that you can configure, for each Destination, how important it is to contact them.
Usually, you'd want to focus on MEPs that are still undecided on the policy your campaign attempts to influence, and not waste time and money calling people who are guaranteed to oppose you (or guaranteed to support you).
Therefore, DearMEP uses a concept we call [Swayability](../doc/selecting-destinations.md) to calculate a kind of scoring to determine the priority assigned to a Destination.
Of course, these criteria vary wildly between the policy issue at hand, and therefore you need to provide DearMEP with your desired scores as well.

We have a separate document on [how to convert data for use in DearMEP](../doc/data-conversion.md) that talks about tools and methods in general, but also how to get a list of MEPs from publicly available data.

Importing Swayability scores is done using the `dearmep import swayability` command.
Calling it with `--help` provides information about the CSV format it expects.
The scoring algorithm is explained and configured in DearMEP's config file; look for the `recommender` section.

## Database Migrations

DearMEP is using [Alembic](https://alembic.sqlalchemy.org/) to manage the database and perform version upgrades to it.
Currently, this is a manual process.

### For Administrators of a DearMEP Instance

If you upgrade DearMEP, make sure to `alembic upgrade head` before starting the `dearmep serve` process again.
It will ensure that all changes to the database structure required for the new version are applied.
Make sure to have a backup of your database, just in case.

### For Developers

If you change the models which are reflected in the database, you'll need to do use Alembic to handle database migrations. You can create migrations via

```sh
alembic revision --autogenerate --message "your short alembic message about the reason of this migration"
```

Alembic generates a file in `migrations/versions/`. **Check this file** for sanity. You can edit or delete this file though this usually should not be necessary. If you are happy about the migration, commit to version control.

Make sure to `upgrade` the database to the latest revision when developing. It is recommended to check the upgrades first, for example by making a copy of the database source and changing the `sqlalchemy.uri` in the `alembic.ini` or by checking the raw SQL with the `--sql` flag.

Please check [Alembic's documentation](https://alembic.sqlalchemy.org/en/latest/) for more.

## Running a Development Server

```sh
dearmep serve --log-level debug --reload
```

You can modify the port with `-p 1234`.
By default, DearMEP will serve on port 8000.

See `dearmep serve --help` for other options, including how to start it via a custom ASGI server.

## Serving Static Files (e.g. the Client)

If you set the environment variable `DEARMEP_STATIC_FILES_DIR` to a directory path, DearMEP will provide the contents of that directory at `/static/`.
This can be used to serve the JavaScript, CSS and assets of the client snippet.
There are no directory indexes and there is no `index.html` support.

Pre-built releases of DearMEP come bundled with a client snippet (in `dearmep/static_files/static`), and their `DEARMEP_STATIC_FILES_DIR` will default to that bundled snippet.
(Set the environment variable to an empty string to disable the bundled snippet.)

**Even if you use this feature, you are still expected to run a reverse proxy server for additional stability.**
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

You can also view the specification of the `main` branch (i.e. the current development version) online, [in ReDoc](https://redocly.github.io/redoc/?url=https://akvorrat.github.io/dearmep/openapi.json) or [in Swagger UI](https://validator.swagger.io/?url=https://akvorrat.github.io/dearmep/openapi.json).

## Running Behind a Reverse Proxy

If you run DearMEP behind a reverse proxy like [Caddy](https://caddyserver.com/), [nginx](https://nginx.org/) or [Træfik](https://traefik.io/traefik/), make sure to provide the remote client’s original IP address via the `X-Forwarded-For` header.
This is required for the geolocation to work.

For nginx, and if you’re using `dearmep serve`, check out [Uvicorn’s best practices](https://www.uvicorn.org/deployment/#running-behind-nginx).
`dearmep serve` currently doesn’t support listening to a Unix domain socket, so please use a normal TCP HTTP connection instead (e.g. `proxy_pass http://localhost:8000/;`).

## Prometheus Metrics

DearMEP exports [Prometheus](https://prometheus.io/) metrics on the usual `/metrics` endpoint, providing you with insight about the health of the system as well as statistics.
The [available metrics](../doc/metrics.md) are documented on a separate page.

Note that you probably don't want to allow public access to these metrics.
They don't contain user data, but do expose information about the phone numbers DearMEP itself is using to call people, which destination is being called how often and for how long, as well as cost statistics.
