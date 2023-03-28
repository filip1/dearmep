import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CallingComponent } from './calling.component';
import { HomeStepComponent } from './steps/home-step/home-step.component';
import { VerifyNumerComponent } from './steps/verify-numer/verify-numer.component';
import { AppCommonModule } from '../common/app-common.module';


@NgModule({
  declarations: [
    CallingComponent,
    HomeStepComponent,
    VerifyNumerComponent,
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
