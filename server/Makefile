# SPDX-FileCopyrightText: © 2024 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

.PHONY: all flint fmt lint noqa qa sync test trans types


# By default, run all the formatting, linting, and testing.
all: flint qa


# Run formatting and linting. This is fast and can be done on every save, for
# example, if you want.
flint: fmt lint


# Format the code. Sort imports first, as recommended by
# <https://docs.astral.sh/ruff/formatter/#sorting-imports>. This should also
# satisfy the recommendation of running the linter with ISC disabled before
# running the formatter, as noted in the ISC001 and ISC002 rules.
# <https://docs.astral.sh/ruff/rules/single-line-implicit-string-concatenation/#formatter-compatibility>
fmt:
	uv run ruff check --fix --select I
	uv run ruff format


# Lint the code.
lint:
	uv run ruff check --fix


# Add "noqa" markers to everything that the linter complains about. This can be
# handy to use once you've fixed all legitimate warnings, to silence the rest
# (hopefully because they're false positives).
noqa:
	uv run ruff check --add-noqa


# Check type annotations and run tests. This is a bit slower and recommended not
# after every save, but before committing.
qa: types test trans


# Sync the environment with all extras.
sync:
	uv sync --all-extras

# Run tests.
test:
	uv run pytest


# Look for untranslated strings in the configuration.
trans:
	uv run dearmep check translations


# Check type annotations.
types:
	uv run mypy
