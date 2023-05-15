from datetime import datetime
from typing import Any, Dict, List, Optional, TypedDict
from uuid import uuid4

from pydantic import UUID4, BaseModel
from sqlmodel import Column, Field, Relationship, SQLModel, TIMESTAMP, func

from ..models import CountryCode


class _SchemaExtra(TypedDict):
    schema_extra: Dict[str, Any]


def _example(value: Any) -> _SchemaExtra:
    """Convenience function to add examples to SQLModel Fields."""
    return {
        "schema_extra": {
            "example": value,
        },
    }


class _SARelationshipKWArgs(TypedDict):
    sa_relationship_kwargs: Dict[str, str]


def _rel_join(join: str) -> _SARelationshipKWArgs:
    """Convenience function to disambiguate Relationship associations."""
    return {
        "sa_relationship_kwargs": {
            "primaryjoin": join,
        },
    }


CONTACT_TYPES = (
    "email", "facebook", "fax", "instagram", "phone", "twitter", "web",
)


class ModifiedTimestampMixin(BaseModel):
    modified_at: Optional[datetime] = Field(
        sa_column=Column(
            TIMESTAMP(timezone=True),
            nullable=False,
            server_default=func.now(),
        ),
        description="Timestamp of last modification.",
    )


class Blob(SQLModel, ModifiedTimestampMixin, table=True):
    """A binary data object, e.g. an image or audio."""
    __tablename__ = "blobs"
    id: Optional[int] = Field(
        None,
        primary_key=True,
        description="A (probably auto-generated) ID to uniquely identify this "
        "Blob.",
    )
    type: str = Field(
        index=True,
        description="A value to help organize Blobs into categories, e.g. "
        "`logo`, `portrait`, `name_audio` etc.",
        **_example("logo"),
    )
    mime_type: str = Field(
        description="The MIME type of this Blob.",
        **_example("image/svg+xml"),
    )
    name: str = Field(
        index=True,
        description="The name of this Blob. Should be a valid file name.",
        **_example("dearmep.svg"),
    )
    description: Optional[str] = Field(
        None,
        description="An optional description of this Blob.",
        **_example("SVG logo of DearMEP"),
    )
    etag: UUID4 = Field(
        default_factory=uuid4,
        sa_column_kwargs={
            "onupdate": uuid4,
        },
        description="An opaque value that will change on every update.",
        **_example("d36bbbf4-0fd1-4ecf-a3e7-696521656a2f"),
    )
    data: bytes = Field(
        description="The actual binary content.",
    )


class Contact(SQLModel, table=True):
    """A single contact datum (e.g. website) belonging to a Destination."""
    __tablename__ = "contacts"
    id: Optional[int] = Field(
        None,
        primary_key=True,
        description="A (probably auto-generated) ID to uniquely identify this "
        "Contact.",
    )
    destination_id: str = Field(
        foreign_key="destinations.id", index=True,
        description="The Destination this Contact belongs to.",
    )
    destination: "Destination" = Relationship(
        back_populates="contacts",
    )
    type: str = Field(
        index=True,
        description="Which type of Contact this is. Can be any string that "
        "makes sense for the campaign. Some suggested values are: " +
        ", ".join(map(lambda k: f"`{k}`", CONTACT_TYPES)),
        **_example(CONTACT_TYPES[0]),
    )
    group: Optional[str] = Field(
        None,
        index=True,
        description="An optional identifier for grouping Contacts into "
        "categories. Can be used to identify `home` and `work` addresses, for "
        "example, or `brussels` and `strasbourg` phone numbers for Members of "
        "the European Parliament, etc.",
        **_example("brussels"),
    )
    contact: str = Field(
        description="The actual Contact address/number/URL/etc, depending on "
        "the `type`.",
        **_example("j.m.mierscheid@example.org"),
    )


class DestinationGroupLink(SQLModel, table=True):
    """Association between a Destination and a DestinationGroup."""
    __tablename__ = "dest_group_link"
    destination_id: Optional[str] = Field(
        None,
        foreign_key="destinations.id", primary_key=True,
    )
    group_id: Optional[int] = Field(
        None,
        foreign_key="dest_groups.id", primary_key=True,
    )


class Destination(SQLModel, table=True):
    """A person (or entity) users are supposed to contact."""
    __tablename__ = "destinations"
    id: str = Field(
        primary_key=True,
        description="A unique string to identify this Destination.",
        **_example("36e04ddf-73e7-4af6-a8af-24556d610f6d"),
    )
    name: str = Field(
        description="The Destination’s name.",
        **_example("Jakob Maria MIERSCHEID"),
    )
    country: Optional[CountryCode] = Field(
        None,
        index=True,
        description="The country code associated with this Destination.",
    )
    portrait_id: Optional[int] = Field(
        None,
        foreign_key="blobs.id",
        description="The portrait image of this Destination.",
    )
    portrait: Optional[Blob] = Relationship(
        **_rel_join("Destination.portrait_id==Blob.id"),
    )
    name_audio_id: Optional[int] = Field(
        None,
        foreign_key="blobs.id",
        description="The spoken name of this Destination.",
    )
    name_audio: Optional[Blob] = Relationship(
        **_rel_join("Destination.name_audio_id==Blob.id"),
    )
    groups: List["DestinationGroup"] = Relationship(
        back_populates="destinations", link_model=DestinationGroupLink,
    )
    contacts: List[Contact] = Relationship(back_populates="destination")


class DestinationGroup(SQLModel, table=True):
    """A group to which Destinations may belong."""
    __tablename__ = "dest_groups"
    id: Optional[int] = Field(
        None,
        primary_key=True,
        description="A (probably auto-generated) ID to uniquely identify this "
        "Group.",
    )
    type: str = Field(
        index=True,
        description="Which type of Group this is. Can be any string that "
        "makes sense for the campaign. Some suggested values are `parl_group` "
        "(parliamentary group, “Fraktion” in German), `party`, `committee`, "
        "`delegation` etc.",
        **_example("parl_group"),
    )
    name: str = Field(
        unique=True,
        description="The short name of this group.",
        **_example("S&D"),
    )
    long_name: str = Field(
        description="The long name of this group.",
        **_example("Group of the Progressive Alliance of Socialists and "
                   "Democrats in the European Parliament"),
    )
    logo_id: Optional[int] = Field(
        None,
        foreign_key="blobs.id",
        description="The logo of this group.",
    )
    logo: Optional[Blob] = Relationship()
    destinations: List[Destination] = Relationship(
        back_populates="groups", link_model=DestinationGroupLink,
    )
