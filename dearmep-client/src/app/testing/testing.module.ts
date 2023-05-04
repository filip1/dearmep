import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { HttpClientTestingModule } from '@angular/common/http/testing';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NoopAnimationsModule,
    TranslocoTestingModule,
    HttpClientTestingModule,
  ],
  providers: [
  ],
  exports: [ 
    NoopAnimationsModule,
    TranslocoTestingModule,
    CommonModule,
    HttpClientTestingModule,
  ]
})
export class TestingModule { }
