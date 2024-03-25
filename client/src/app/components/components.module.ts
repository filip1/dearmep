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
import { CallingButtonsComponent } from './calling-buttons/calling-buttons.component';

@NgModule({
    imports: [
        AppCommonModule,
        CommonModule,
        TranslocoModule,
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
        CallingButtonsComponent,
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
        CallingButtonsComponent,
    ]
})
export class ComponentsModule { }
