// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ValidationErrors } from '@angular/forms';

export interface PhoneNumberValidationErrors extends ValidationErrors {
  isEmptyError?: boolean;
  isInvalidError?: boolean;
  isNotAllowedError?: boolean;
  isBlockedError?: boolean;
  isTooManyAttempts?: boolean;
}
