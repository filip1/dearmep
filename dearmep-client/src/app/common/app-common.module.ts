import { NgModule } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { MaterialModule } from './material/material.module';
import { SafePipe } from './pipes/safe.pipe';

@NgModule({
  declarations: [
    SafePipe,
  ],
  imports: [
    MaterialModule,
    TranslocoModule,
  ],
  exports: [
    SafePipe,
    MaterialModule,
    TranslocoModule,
  ]
})
export class AppCommonModule { }
