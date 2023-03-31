import { NgModule } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { MaterialModule } from './material/material.module';
import { SafePipe } from './pipes/safe.pipe';
import { ResponsiveDirective } from './directives/responsive.directive';

@NgModule({
  declarations: [
    SafePipe,
    ResponsiveDirective,
  ],
  imports: [
    MaterialModule,
    TranslocoModule,
  ],
  exports: [
    SafePipe,
    MaterialModule,
    TranslocoModule,
    ResponsiveDirective,
  ]
})
export class AppCommonModule { }
