import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TwoColumnLayoutComponent } from './two-column-layout/two-column-layout.component';

@NgModule({
  declarations: [
    TwoColumnLayoutComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    TwoColumnLayoutComponent,
  ]
})
export class LayoutModule { }
