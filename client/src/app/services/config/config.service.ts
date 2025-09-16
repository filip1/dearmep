// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Injectable, inject } from '@angular/core';
import { AppConfig } from './app-config.model';
import {
  BehaviorSubject,
  Observable,
  filter,
  firstValueFrom,
  map,
  take,
} from 'rxjs';
import { ApiService } from 'src/app/api/services';
import { LocalStorageService } from '../local-storage/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly apiService = inject(ApiService);
  private readonly localStorageService = inject(LocalStorageService);

  private readonly languageStorageKey = 'language';
  private readonly countryStorageKey = 'country';

  private readonly availableCallingCodes = {
    BE: '+32',
    BG: '+359',
    CZ: '+420',
    DK: '+45',
    DE: '+49',
    EE: '+372',
    IE: '+353',
    GR: '+30',
    ES: '+34',
    FR: '+33',
    HR: '+385',
    IT: '+39',
    CY: '+357',
    LV: '+371',
    LT: '+370',
    LU: '+352',
    HU: '+36',
    MT: '+356',
    NL: '+31',
    AT: '+43',
    PL: '+48',
    PT: '+351',
    RO: '+40',
    SI: '+386',
    SK: '+421',
    FI: '+358',
    SE: '+46',
  };

  private config$ = new BehaviorSubject<AppConfig | undefined>(undefined);
  private config?: AppConfig;

  private language: string | undefined;
  private availableLanguages: string[] | undefined;

  // Note: This service should depend on as few services as possible as it is used early in the bootstrap process
  constructor() {
    const userSelectedLanguage = this.getSelectedLanguage();
    this.getServerConfig$(userSelectedLanguage);
  }

  public getConfig$(): Observable<AppConfig> {
    return this.config$.pipe(filter(c => !!c));
  }

  public setConfig(config: AppConfig) {
    this.config$.next(config);
    this.config = config;
  }

  public getConfig(): AppConfig {
    if (!this.config) {
      throw Error('config not initialized');
    }
    return this.config;
  }

  public getLanguage(): string | undefined {
    return this.language;
  }

  public getAvailableLanguages(): string[] | undefined {
    return this.availableLanguages;
  }

  // This method is called during the app bootstrap process
  public async initialize(): Promise<void> {
    await firstValueFrom(this.getConfig$());
  }

  public getSelectedLanguage(): string | undefined {
    return (
      this.localStorageService.getString(this.languageStorageKey) || undefined
    );
  }

  public setSelectedLanguage(language: string) {
    this.localStorageService.setString(this.languageStorageKey, language);
  }

  public getSelectedCountry(): string | undefined {
    return (
      this.localStorageService.getString(this.countryStorageKey) || undefined
    );
  }

  public setSelectedCountry(country: string) {
    this.localStorageService.setString(this.countryStorageKey, country);
  }

  private getServerConfig$(acceptedLanguage: string | undefined) {
    this.apiService
      .getFrontendSetup({
        frontend_strings: true,
        'accept-language': acceptedLanguage,
      })
      .pipe(
        take(1),
        map(c => {
          const config = c as AppConfig;
          config.availableCallingCodes = this.availableCallingCodes;
          return config;
        })
      )
      .subscribe({
        next: c => {
          this.language = c.language.recommended;
          this.availableLanguages = c.language.available;
          this.setConfig(c);
        },
        error: e =>
          console.error('ERROR: Failed to load config from server!', e),
      });
  }
}
