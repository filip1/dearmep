# SPDX-FileCopyrightText: © 2022 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

import enum


class ActionIfExists(str, enum.Enum):
    SKIP = "skip"
    OVERWRITE = "overwrite"
    FAIL = "fail"
