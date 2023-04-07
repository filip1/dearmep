import { Component } from '@angular/core';
import { FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CallingStateManagerService } from 'src/app/services/calling/calling-state-manager.service';
import { VerificationStep } from './verification-step.enum';

@Component({
  selector: 'dmep-verify-numer',
  templateUrl: './verify-numer.component.html',
  styleUrls: ['./verify-numer.component.scss']
})
export class VerifyNumerComponent {
  private readonly numberValidator: ValidatorFn = (control): ValidationErrors | null => {
    if (control.value?.length > 0) {
      return null
    }
    return { numberError: "invalid-number" }
  }

  private readonly codeValidator: ValidatorFn = (control): ValidationErrors | null => {
    if (control.value?.length > 0) {
      return null
    }
    return { numberError: "invalid-number" }
  }

  public readonly StepEnterNumber = VerificationStep.EnterNumber
  public readonly StepEnterCode = VerificationStep.EnterCode
  public readonly StepSuccess = VerificationStep.Success

  public step = this.StepEnterNumber

  constructor(
    private readonly callingStateManager: CallingStateManagerService,
  ) { }

  public numberFormControl = new FormControl<string | undefined>(undefined, {
    validators: this.numberValidator,
    updateOn: 'change',
  })
  public acceptPolicy = false

  public codeFormControl = new FormControl<string | undefined>(undefined, {
    validators: this.codeValidator,
    updateOn: 'change',
  })

  public onEditNumberClick() {
    this.step = VerificationStep.EnterNumber
  }

  public onSendCodeClick() {
    this.step = VerificationStep.EnterCode
  }

  public onVerifyCodeClick() {
    this.step = VerificationStep.Success
  }

  public onCallNowClick() {
    this.callingStateManager.setUpCall()
  }

  public onCallLaterClick() {
    this.callingStateManager.goToSchedule()
  }

  public onShowPolicyClick() {
    console.log("show policy")
  }
}
