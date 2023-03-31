import { NgModule } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { MaterialModule } from './material/material.module';
import { SafePipe } from './pipes/safe.pipe';
import { ResponsiveDirective } from './directives/responsive.directive';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    SafePipe,
    ResponsiveDirective,
  ],
  imports: [
    MaterialModule,
    TranslocoModule,
    ReactiveFormsModule,
  ],
  exports: [
    SafePipe,
    MaterialModule,
    TranslocoModule,
    ResponsiveDirective,
    ReactiveFormsModule,
  ]
})
export class AppCommonModule { }
