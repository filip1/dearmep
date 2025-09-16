# SPDX-FileCopyrightText: © 2025 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from collections.abc import Iterable
from io import BufferedReader

import zstandard


def zstd_decompressor(input: BufferedReader) -> Iterable[bytes]:
    dctx = zstandard.ZstdDecompressor()
    return dctx.read_to_iter(input)
