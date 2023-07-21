from io import BufferedReader
from typing import Iterable

import lzip  # type: ignore[import]


def lz_decompressor(input: BufferedReader) -> Iterable[bytes]:
    return lzip.decompress_file_like_iter(input)  # type: ignore[no-any-return]
