import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CallingComponent } from './calling.component';
import { HomeStepComponent } from './steps/home-step/home-step.component';
import { VerifyNumerComponent } from './steps/verification-step/verify-numer.component';
import { AppCommonModule } from '../common/app-common.module';
import { SetupStepComponent } from './steps/setup-step/setup-step.component';
import { FeedbackStepComponent } from './steps/feedback-step/feedback-step.component';
import { UpdateCallScheduleComponent } from './steps/update-call-schedule/update-call-schedule.component';


@NgModule({
  declarations: [
    CallingComponent,
    HomeStepComponent,
    VerifyNumerComponent,
    SetupStepComponent,
    FeedbackStepComponent,
    UpdateCallScheduleComponent,
  ],
  imports: [
    CommonModule,
    AppCommonModule,
  ],
  exports: [
    CallingComponent,
  ]
})
export class CallingModule { }
