import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CallingComponent } from './calling.component';
import { HomeStepComponent } from './steps/home-step/home-step.component';
import { VerifyNumberComponent } from './steps/verify-number-step/verify-number.component';
import { AppCommonModule } from '../common/app-common.module';
import { SetupStepComponent } from './steps/setup-step/setup-step.component';
import { ComponentsModule } from '../components/components.module';
import { FeedbackStepComponent } from './steps/feedback-step/feedback-step.component';
import { UpdateCallScheduleComponent } from './steps/update-call-schedule/update-call-schedule.component';


@NgModule({
    imports: [
        CommonModule,
        ComponentsModule,
        AppCommonModule,
        ComponentsModule,
        CallingComponent,
        HomeStepComponent,
        VerifyNumberComponent,
        SetupStepComponent,
        FeedbackStepComponent,
        UpdateCallScheduleComponent,
    ],
    exports: [
        CallingComponent,
    ]
})
export class CallingModule { }
