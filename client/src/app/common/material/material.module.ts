import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule, MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ShadowRootOverlayContainer } from './shadow-root-overlay-container';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [],
  imports: [
    MatButtonModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatRadioModule,
    MatButtonToggleModule,
    MatTooltipModule,
    OverlayModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    { provide: OverlayContainer, useClass: ShadowRootOverlayContainer },
    { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-icons-outlined' } },
  ],
  exports: [
    MatButtonModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatRadioModule,
    MatButtonToggleModule,
    MatTooltipModule,
    OverlayModule,
    MatProgressSpinnerModule,
  ]
})
export class MaterialModule { }
