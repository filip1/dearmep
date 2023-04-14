import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NoopAnimationsModule,
  ],
  providers: [
  ],
  exports: [ 
    NoopAnimationsModule,
  ]
})
export class TestingModule { }
