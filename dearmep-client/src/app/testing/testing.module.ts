import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoTestingModule } from '@ngneat/transloco';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NoopAnimationsModule,
    TranslocoTestingModule,
  ],
  providers: [
  ],
  exports: [ 
    NoopAnimationsModule,
    TranslocoTestingModule,
    CommonModule,
  ]
})
export class TestingModule { }
