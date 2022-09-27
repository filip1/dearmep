from contextlib import contextmanager
from os import environ
from pathlib import Path
from typing import Callable, Dict, Optional

from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic.utils import deep_update
import pytest
import yaml

from dearmep.main import start


FactoryType = Callable[[Optional[dict]], FastAPI]


@contextmanager
def modified_environ(changes: Dict[str, str]):
    """Change env variables while in the context, then change them back."""
    origs: Dict[str, Optional[str]] = {}
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
    config_path = Path(top_dir, "example-config.yaml") \
        if config_path is None else config_path

    # Allow dynamically passing config YAML.
    if config_content is not None:
        config_path.write_bytes(config_content)

    with modified_environ({"DEARMEP_CONFIG": str(config_path)}):
        yield start


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
    with open(environ["DEARMEP_CONFIG"], "r") as f:
        config_dict_orig = yaml.load(f, yaml.Loader)
    # Modify the MMDB.
    config_dict = deep_update(config_dict_orig, {
        "l10n": {"geo_mmdb": str(Path(tests_dir, "geo_ip", "test.mmdb"))},
    })

    app = factory(config_dict)

    yield app


@pytest.fixture
def fastapi_app(fastapi_factory: FactoryType):
    with fastapi_app_func(fastapi_factory) as app:
        yield app


@pytest.fixture
def client(fastapi_app: FastAPI):
    yield TestClient(fastapi_app)
