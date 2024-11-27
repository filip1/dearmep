// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { HttpErrorResponse } from '@angular/common/http';

export interface TypedHttpError<T> extends HttpErrorResponse {
  readonly error: T | null | undefined;
}
