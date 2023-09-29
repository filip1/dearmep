import { ValidationErrors } from '@angular/forms';

export interface PhoneNumberValidationErrors extends ValidationErrors {
  isEmptyError?: boolean;
  isInvalidError?: boolean;
  isNotAllowedError?: boolean;
}
