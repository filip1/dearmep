from typing import Callable

from fastapi import FastAPI
from pydantic import ValidationError
import pytest
from yaml.parser import ParserError

from dearmep.config import Config, L10nConfig


def test_default_language_in_language_list():
    with pytest.raises(ValidationError) as e_info:
        L10nConfig(languages=["en", "de"], default_language="fr")
    errs = e_info.value.errors()
    assert len(errs) == 1
    assert errs[0]["loc"] == ("default_language",)
    assert errs[0]["type"] == "value_error"
    assert errs[0]["msg"].find(" needs to be in the list of available ") != -1


def test_access_config_without_loading():
    with pytest.raises(
        Exception,
        match=r"attempt to access config without loading it",
    ):
        Config.get()


@pytest.mark.config_path("/this/path/should/not/exist/on/any/sane/system")
def test_config_not_found(fastapi_factory: Callable[[], FastAPI]):
    with pytest.raises(ValidationError) as e_info:
        fastapi_factory()
    errs = e_info.value.errors()
    assert len(errs) == 1
    assert errs[0]["loc"] == ("config_file",)
    assert errs[0]["type"] == "value_error.path.not_exists"


# Syntactically invalid YAML.
@pytest.mark.config_content(b"foo: [ bar\n")
def test_invalid_yaml(fastapi_factory: Callable[[], FastAPI]):
    with pytest.raises(ParserError):
        fastapi_factory()


# YAML is syntactically okay, but missing necessary values.
@pytest.mark.config_content(b"foo: [ bar ]\n")
def test_invalid_config(fastapi_factory: Callable[[], FastAPI]):
    with pytest.raises(ValidationError):
        fastapi_factory()
