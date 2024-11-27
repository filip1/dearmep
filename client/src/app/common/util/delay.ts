// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export function delay(delayMs: number) {
  return new Promise<void>(resolve => setTimeout(resolve, delayMs));
}
