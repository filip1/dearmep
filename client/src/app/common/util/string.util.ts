// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export class StringUtil {
  /***
   * Join list of strings together using a different delimiter for the last element
   */
  public static JoinAnd(
    elements: string[],
    delimiter: string,
    lastDelimiter: string
  ): string {
    if (!elements?.length) {
      return '';
    }

    const lastElement = elements[elements.length - 1];
    const firstElements = elements.slice(undefined, -1);

    if (firstElements.length === 0) {
      return lastElement;
    }

    return [firstElements.join(delimiter), lastElement].join(lastDelimiter);
  }
}
