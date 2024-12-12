# SPDX-FileCopyrightText: © 2022 Tim Weber
# SPDX-FileCopyrightText: © 2023 iameru
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from contextlib import contextmanager
from os import environ
from pathlib import Path
from typing import Callable, Optional

import pytest
import yaml
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic.utils import deep_update
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from dearmep.database.connection import AutoEngine, get_session
from dearmep.database.models import Destination
from dearmep.main import create_app
from dearmep.ratelimit import Limit


FactoryType = Callable[[Optional[dict]], FastAPI]


@contextmanager
def modified_environ(changes: dict[str, str]):
    """Change env variables while in the context, then change them back."""
    origs: dict[str, Optional[str]] = {}
    for name, replacement in changes.items():
        origs[name] = environ.get(name)
        environ[name] = replacement

    yield

    for name, orig in origs.items():
        if orig is None:
            del environ[name]
        else:
            environ[name] = orig


@contextmanager
def fastapi_factory_func(
    config_path: Optional[Path] = None,
    config_content: Optional[bytes] = None,
):
    """Return the app factory, using the example (or a custom) YAML config.

    If you don't supply any argument, the environment will be overridden to use
    the example config. If you supply a config path, it will use that one
    instead. If you supply config contents, it will write those into the
    selected file before using it.

    In other words, if you supply config_content, but not a config_path, this
    will happily overwrite the example config with whatever you specify.
    """
    top_dir = Path(__file__).parent.parent
    # By default, let the tests use the example config.
    config_path = (
        Path(top_dir, "dearmep", "example-config.yaml")
        if config_path is None
        else config_path
    )

    # Allow dynamically passing config YAML.
    if config_content is not None:
        config_path.write_bytes(config_content)

    with modified_environ({"DEARMEP_CONFIG": str(config_path)}):
        yield create_app


@pytest.fixture(name="engine")
def engine_fixture():
    memory_engine = create_engine(
        "sqlite://",  # in-memory database
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    prev_engine = AutoEngine.engine
    AutoEngine.engine = memory_engine
    SQLModel.metadata.create_all(AutoEngine.get_engine())
    yield memory_engine
    if prev_engine:
        AutoEngine.engine = prev_engine


@pytest.fixture(name="session")
def session_fixture(engine):
    with get_session() as session:
        yield session


@pytest.fixture
def with_example_destinations(session: Session):
    session.add(
        Destination(
            id="36e04ddf-73e7-4af6-a8af-24556d610f6d",
            name="Jakob Maria MIERSCHEID",
            sort_name="MIERSCHEID Jakob Maria",
            country="de",
        )
    )
    session.add(
        Destination(
            id="257d8d78-76e2-4391-b542-a1fcdbdf20a9",
            name="Erika MUSTERFRAU",
            sort_name="MUSTERFRAU Erika",
            country="at",
        )
    )
    session.commit()
    return session


@pytest.fixture
def fastapi_factory(request: pytest.FixtureRequest, tmp_path: Path):
    """Provides the app factory.

    This is basically just a fixture wrapping `fastapi_factory_func`. You can
    supply a custom config path using the `config_path` marker, and custom
    config contents using the `config_content` marker. If you use the latter,
    your custom content will always be written to a temporary file.
    """
    # Allow choosing a different config file.
    path_marker = request.node.get_closest_marker("config_path")
    config_path = None if path_marker is None else path_marker.args[0]

    # Allow dynamically passing config YAML.
    content_marker = request.node.get_closest_marker("config_content")
    config_content = None
    if content_marker is not None:
        config_path = tmp_path / "override.yaml"
        config_content = content_marker.args[0]

    with fastapi_factory_func(config_path, config_content) as start:
        yield start


@contextmanager
def fastapi_app_func(factory: FactoryType):
    """Return the FastAPI app.

    The config will be patched to use the test MMDB for geo IP lookups.
    """
    tests_dir = Path(__file__).parent

    # Read the original config file as a Python object.
    with Path(environ["DEARMEP_CONFIG"]).open("r", encoding="utf-8") as f:
        config_dict_orig = yaml.safe_load(f)
    # Modify the MMDB.
    # TODO: This can probably be simplified using Config.set_patch().
    config_dict = deep_update(
        config_dict_orig,
        {
            "l10n": {"geo_mmdb": str(Path(tests_dir, "geo_ip", "test.mmdb"))},
        },
    )

    app = factory(config_dict)

    yield app


@pytest.fixture
def fastapi_app(fastapi_factory: FactoryType):
    with fastapi_app_func(fastapi_factory) as app:
        yield app


@pytest.fixture
def client(fastapi_app: FastAPI, session: Session):
    Limit.reset_all_limits()
    return TestClient(fastapi_app)
