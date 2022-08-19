from fastapi import FastAPI

from . import __version__

from .models import Constraints, ConstraintsSuggestion


app = FastAPI(
    title="Callament",
    version=__version__,
)


@app.get(
    "/constraints",
    response_model=Constraints,
    description="Retrieve the user's current set of constraints.",
)
async def get_constraints() -> Constraints:
    # TODO: Implement
    return Constraints()


@app.get(
    "/constraints/suggestion",
    response_model=ConstraintsSuggestion,
    description="Retrieve suggestions for constraints based on the user's IP "
                "address and browser languages."
)
async def get_constraint_suggestion() -> ConstraintsSuggestion:
    # TODO: Implement.
    return ConstraintsSuggestion(
        countries=("de",),
        languages=("de-de", "de-at", "de", "en"),
    )


@app.patch(
    "/constraints",
    response_model=Constraints,
    description="Update the users's constraints.",
)
async def update_constraints(new: Constraints) -> Constraints:
    # TODO: Implement.
    return new
