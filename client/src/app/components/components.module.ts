import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectMEPComponent } from './select-mep/select-mep.component';
import { TitleComponent } from './title/title.component';
import { TranslocoModule } from '@ngneat/transloco';
import { MEPDetailComponent } from './mep-detail/mep-detail.component';
import { AppCommonModule } from '../common/app-common.module';
import { LanguageSwitchComponent } from './language-switch/language-switch.component';
import { TalkingPointsComponent } from './talking-points/talking-points.component';
import { FooterComponent } from './footer/footer.component';
import { CountrySelectComponent } from './country-select/country-select.component';
import { PhoneNumberInputComponent } from './phone-number-input/phone-number-input.component';
import { SocialIconComponent } from './social-icon/social-icon.component';
import { ErrorModalComponent } from './error-modal/error-modal.component';

@NgModule({
  declarations: [
    SelectMEPComponent,
    TitleComponent,
    MEPDetailComponent,
    LanguageSwitchComponent,
    TalkingPointsComponent,
    FooterComponent,
    CountrySelectComponent,
    PhoneNumberInputComponent,
    SocialIconComponent,
    ErrorModalComponent,
  ],
  imports: [
    AppCommonModule,
    CommonModule,
    TranslocoModule,
  ],
  exports: [
    SelectMEPComponent,
    TitleComponent,
    MEPDetailComponent,
    LanguageSwitchComponent,
    FooterComponent,
    TalkingPointsComponent,
    CountrySelectComponent,
    PhoneNumberInputComponent,
    ErrorModalComponent,
  ]
})
export class ComponentsModule { }
