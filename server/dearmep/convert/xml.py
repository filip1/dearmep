# SPDX-FileCopyrightText: © 2023 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from typing import TYPE_CHECKING, Union, cast


if TYPE_CHECKING:
    from xml.dom.minidom import Element, Text  # noqa: S408


def get_text(node: Union["Element", "Text"]) -> str:
    """Recursively concatenate text nodes in the `node`."""
    if node.nodeType == node.TEXT_NODE:
        # This casting is plain ugly, but otherwise mypy doesn't know it's str.
        return str(cast("Text", node).data)
    return "".join(get_text(child) for child in node.childNodes)
