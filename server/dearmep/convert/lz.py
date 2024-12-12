# SPDX-FileCopyrightText: © 2023 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from collections.abc import Iterable
from io import BufferedReader

import lzip  # type: ignore[import]


def lz_decompressor(input: BufferedReader) -> Iterable[bytes]:
    return lzip.decompress_file_like_iter(input)  # type: ignore[no-any-return]
