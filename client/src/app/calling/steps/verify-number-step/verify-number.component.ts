import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ValidatorFn, Validators } from '@angular/forms';
import { VerificationStep } from './verification-step.enum';
import { PhoneNumber } from 'src/app/model/phone-number.model';
import { TranslocoService } from '@ngneat/transloco';
import { BaseUrlService } from 'src/app/common/services/base-url.service';
import { ApiService } from 'src/app/api/services';
import { L10nService } from 'src/app/services/l10n/l10n.service';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs';
import { PhoneNumberVerificationRejectedResponse, PhoneNumberVerificationResponse, PhoneRejectReason } from 'src/app/api/models';
import { HttpErrorResponse } from '@angular/common/http';
import { PhoneNumberValidationErrors } from 'src/app/components/phone-number-input/phone-number-validation-errors';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { SelectDestinationService } from 'src/app/services/select-destination/select-destination.service';
import { RoutingStateManagerService } from 'src/app/services/routing/routing-state-manager.service';
import { CallingService } from 'src/app/services/calling/calling.service';
import { ErrorService } from 'src/app/services/error/error.service';

@Component({
  selector: 'dmep-verify-number',
  templateUrl: './verify-number.component.html',
  styleUrls: ['./verify-number.component.scss']
})
export class VerifyNumberComponent implements OnInit, OnDestroy {
  private phoneNumberSentToServerForValidation?: string  // The number that correponds to the below error as string => error is not relevant if number changed
  private phoneNumberValidationServerError: PhoneNumberValidationErrors | null = null

  private readonly numberValidator: ValidatorFn = (control): PhoneNumberValidationErrors | null => {
    const number: PhoneNumber | null | undefined = control.value
    if (!number || !number.callingCode || !number.number) {
      return { isEmptyError: true }
    }
    if (this.phoneNumberToString(number) === this.phoneNumberSentToServerForValidation && this.phoneNumberValidationServerError) {
      return this.phoneNumberValidationServerError;
    }
    return null;
  }

  private destroyed$ = new Subject<void>()

  private currentLanguage?: string
  private selectedDestinationID?: string

  public readonly StepEnterNumber = VerificationStep.EnterNumber
  public readonly StepEnterCode = VerificationStep.EnterCode
  public readonly StepSuccess = VerificationStep.Success

  @Input()
  public disableScheduling = false

  public step = this.StepEnterNumber

  public serverValidatedPhoneNumber?: string;

  public numberFormControl = new FormControl<PhoneNumber>({ callingCode: "+43", number: "" }, {
    validators: [ this.numberValidator ],
    updateOn: 'change',
  })

  public acceptPolicy = false

  public codeFormControl = new FormControl<string | null>(null, {
    validators: [ Validators.required ],
    updateOn: 'change',
  })

  constructor(
    private readonly routingStateManager: RoutingStateManagerService,
    private readonly callintService: CallingService,
    private readonly translocoService: TranslocoService,
    private readonly baseUrlService: BaseUrlService,
    private readonly apiService: ApiService,
    private readonly l10nService: L10nService,
    private readonly authenticationService: AuthenticationService,
    private readonly selectDestinationService: SelectDestinationService,
    private readonly errorService: ErrorService,
  ) {
  }

  public ngOnInit(): void {
    this.l10nService.getLanguage$().pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (l) => this.currentLanguage = l
    })
    this.selectDestinationService.getDestination$().pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (d) => this.selectedDestinationID = d?.id
    })
  }

  public ngOnDestroy(): void {
    this.destroyed$.next()
    this.destroyed$.complete()
  }

  public onEditNumberClick() {
    this.step = VerificationStep.EnterNumber
  }

  public onSendCodeClick() {
    if (!this.acceptPolicy || !this.currentLanguage || !this.numberFormControl.valid) {
      return
    }

    const phoneNumber = this.phoneNumberToString(this.numberFormControl.value)
    this.apiService.requestNumberVerification({
      body: {
        phone_number: phoneNumber,
        language: this.currentLanguage,
        accepted_dpp: this.acceptPolicy,
      }
    }).subscribe({
      next: (response: PhoneNumberVerificationResponse) => {
        this.phoneNumberValidationServerError = null;
        this.phoneNumberSentToServerForValidation = phoneNumber
        this.numberFormControl.updateValueAndValidity()

        this.serverValidatedPhoneNumber = response.phone_number;
        this.step = VerificationStep.EnterCode
      },
      error: (err: HttpErrorResponse | unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 422) {
          this.phoneNumberValidationServerError = { isInvalidError: true }
        } else if (err instanceof HttpErrorResponse && err.status === 400 && err.error.errors?.length) {
          const errBody: PhoneNumberVerificationRejectedResponse = err.error
          const firstError = errBody.errors[0] // API specifies that the first error is the most important one in case of multiple errors

          if (firstError === PhoneRejectReason.DisallowedType || firstError === PhoneRejectReason.DisallowedCountry) {
            this.phoneNumberValidationServerError = { isNotAllowedError: true }
          } else if (firstError === PhoneRejectReason.InvalidPattern) {
            this.phoneNumberValidationServerError = { isInvalidError: true }
          } else if (firstError === PhoneRejectReason.Blocked) {
            this.phoneNumberValidationServerError = { isBlockedError: true }
          } else if (firstError === PhoneRejectReason.TooManyVerificationRequests) {
            this.phoneNumberValidationServerError = { isTooManyAttempts: true }
          } else {
            this.errorService.handleUnknownError(err)
          }
        } else {
          this.errorService.handleUnknownError(err)
        }

        this.phoneNumberSentToServerForValidation = phoneNumber
        this.numberFormControl.updateValueAndValidity()
      }
    })
  }

  public onVerifyCodeClick() {
    if (!this.codeFormControl.value || !this.serverValidatedPhoneNumber) {
      return
    }

    this.apiService.verifyNumber({
      body: {
        code: this.codeFormControl.value,
        phone_number: this.serverValidatedPhoneNumber,
      }
    }).subscribe({
      next: (response) => {
        this.authenticationService.setToken(response, this.serverValidatedPhoneNumber as string)
        this.step = VerificationStep.Success
      },
      error: (err: HttpErrorResponse | unknown) => {
        if (err instanceof HttpErrorResponse && (err.status === 400 || err.status === 422)) {
          this.codeFormControl.setErrors({ invalidCode: true })
        } else {
          this.errorService.handleUnknownError(err)
        }
      }
    })
  }

  public onCallNowClick() {
    if (!this.currentLanguage || !this.selectedDestinationID) {
      return
    }
    this.routingStateManager.callNow()
  }

  public onCallLaterClick() {
    this.routingStateManager.scheduleCall()
  }

  public getPolicyLinkHtml(): string {
    const policyUrlKey = 'verification.enterNumber.policyLinkUrl'
    const policyUrl = this.translocoService.translate(policyUrlKey)
    let linkText = this.translocoService.translate('verification.enterNumber.policyLinkText')

    if (policyUrl === policyUrlKey) {
      console.error("Missing privacy policy url!")
    }
    if (!linkText) {
      linkText = policyUrl
    }

    let absPolicyUrl = policyUrl
    try {
      absPolicyUrl = this.baseUrlService.toAbsoluteAPIUrl(policyUrl)
    } catch (err) {
      console.error("failed to convert url to absolute", err)
    }

    return `<a href="${ absPolicyUrl }" target="_blank">${ linkText }</a>`
  }

  private phoneNumberToString(number: PhoneNumber | null): string {
    if (!number  || !number.callingCode || !number.number) {
      return ''
    }
    return `${number.callingCode} ${number.number}`
  }
}
