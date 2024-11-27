#!/bin/sh

# SPDX-FileCopyrightText: © 2022 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

poetry run sh -c 'ruff check; mypy && mypy tests && pytest && dearmep check translations'
