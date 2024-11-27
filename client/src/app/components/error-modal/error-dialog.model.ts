// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export interface ErrorDialogModel {
  title: string;
  body: string;
  buttonAcceptText: string;
  buttonCancelText?: string;
}
