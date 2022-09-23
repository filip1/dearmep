from pathlib import Path
import re
from typing import Any, ClassVar, Dict, List, Optional

from pydantic import BaseModel, BaseSettings, ConstrainedStr, Field, \
                     FilePath, validator
import yaml


APP_NAME = "Callament"
ENV_PREFIX = f"{APP_NAME.upper()}_"


class Language(ConstrainedStr):
    regex = re.compile(r"^[a-zA-Z]{2,8}(-[a-zA-Z0-9]{1,8})*$")


class L10nConfig(BaseModel):
    languages: List[Language]
    default_language: Language
    geo_mmdb: Optional[FilePath]

    @validator("default_language")
    def default_language_must_be_in_languages(
        cls,
        v: Language,
        values: Dict[str, Any],
    ):
        if "languages" in values and v not in values["languages"]:
            raise ValueError(
                f"default language '{v}' needs to be in the list of available "
                f"languages: {values['languages']}"
            )
        return v


class Config(BaseModel):
    """The main application configuration supplied via the config file."""
    l10n: L10nConfig

    _instance: ClassVar[Optional["Config"]] = None

    @classmethod
    def get(cls) -> "Config":
        """Get the singleton configuration object instance."""
        if cls._instance is None:
            raise Exception("attempt to access config without loading it "
                            "first; this is a bug")
        return cls._instance

    @classmethod
    def load_dict(cls, obj: Dict) -> "Config":
        cls._instance = cls.parse_obj(obj)
        return cls._instance

    @classmethod
    def load_yaml_file(cls, filename: Path) -> "Config":
        with filename.open("r") as f:
            return cls.load_dict(yaml.load(f, yaml.Loader))


class Settings(BaseSettings):
    """Settings supplied via environment variables."""
    config_file: FilePath = Field(
        "config.yaml",
        env=f"{ENV_PREFIX}CONFIG",
    )

    class Config:
        env_prefix = ENV_PREFIX
