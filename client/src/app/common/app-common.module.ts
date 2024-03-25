import { NgModule } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { MaterialModule } from './material/material.module';
import { SafePipe } from './pipes/safe.pipe';
import { ResponsiveDirective } from './directives/responsive.directive';
import { ReactiveFormsModule } from '@angular/forms';
import { ToAbsolutePipe } from './pipes/to-absolute.pipe';

@NgModule({
    imports: [
        MaterialModule,
        TranslocoModule,
        ReactiveFormsModule,
        SafePipe,
        ResponsiveDirective,
        ToAbsolutePipe,
    ],
    exports: [
        SafePipe,
        MaterialModule,
        TranslocoModule,
        ResponsiveDirective,
        ReactiveFormsModule,
        ToAbsolutePipe,
    ]
})
export class AppCommonModule { }
