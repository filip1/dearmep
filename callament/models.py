from re import compile
from typing import Optional, Tuple

from pydantic import BaseModel, ConstrainedInt, ConstrainedStr, Field


class Country(ConstrainedStr):
    to_lower = True
    regex = compile(r"[a-z]{2}")


class Hour(ConstrainedInt):
    ge = 0
    lt = 24


class HourRange(BaseModel):
    start: Hour
    end: Hour
    # TODO: Validation.


class Language(ConstrainedStr):
    to_lower = True
    regex = compile(r"[a-z]{2}(?:-[a-z]{2})?")


class Weekday(ConstrainedInt):
    ge = 0
    le = 6


class Schedule(BaseModel):
    weekdays: Tuple[Weekday, ...]
    hours: Tuple[HourRange, ...]


class ConstraintsSuggestion(BaseModel):
    countries: Optional[Tuple[Country, ...]] = Field(
        description="The countries the user resides in or otherwise is "
                    "associated with.",
        example=("at", "de"),
    )
    languages: Optional[Tuple[Language, ...]] = Field(
        description="The languages the user is confident in.",
        example=("de-at", "de", "en"),
    )


class Constraints(ConstraintsSuggestion):
    schedules: Optional[Tuple[Schedule, ...]] = Field(
        description="When the user is available for a call.",
        example=(Schedule(
            weekdays=(0, 1, 2, 4),
            hours=(HourRange(start=9, end=12), HourRange(start=13, end=17)),
        ),)
    )
