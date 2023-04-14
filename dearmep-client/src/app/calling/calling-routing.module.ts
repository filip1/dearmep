import { PlatformLocation } from '@angular/common';
import { MockPlatformLocation } from '@angular/common/testing';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeStepComponent } from './steps/home-step/home-step.component';
import { VerifyNumerComponent } from './steps/verify-numer/verify-numer.component';

const routes: Routes = [
  {
    path: "",
    pathMatch: 'full',
    component: HomeStepComponent,
    outlet: 'calling-router',
  },
  {
    path: "verify",
    pathMatch: 'full',
    component: VerifyNumerComponent,
    outlet: 'calling-router',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  providers: [
    // This way routing events do not lead to actual location changes outside of the component
    { provide: PlatformLocation, useClass: MockPlatformLocation }
  ],
  exports: [RouterModule]
})
export class CallingRoutingModule { }
