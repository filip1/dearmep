from typing import Optional, Tuple

from pydantic import BaseModel, Field, conint, constr


Country = constr(to_lower=True, regex="[a-z]{2}")

Language = constr(to_lower=True, regex="[a-z]{2}(?:-[a-z]{2})?")

Weekday = conint(ge=0, le=6)


class HourRange(BaseModel):
    start: conint(ge=0, lt=24)
    end: conint(ge=0, lt=24)
    # TODO: Validation.


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
