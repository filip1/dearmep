// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export class MarkupUtil {
  public static NoWrap(
    str: string | null | undefined,
    classNames = 'dmep-nowrap'
  ): string | null | undefined {
    if (!str) {
      return str;
    }
    return `<span class="${classNames}">${str}</span>`;
  }
}
