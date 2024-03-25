import {
  TRANSLOCO_LOADER,
  Translation,
  TranslocoLoader,
  TRANSLOCO_CONFIG,
  translocoConfig,
  TranslocoModule,
} from '@ngneat/transloco';
import { Injectable, isDevMode, NgModule } from '@angular/core';
import { Observable, map, mergeMap, of } from 'rxjs';
import { ApiService } from './api/services';
import { ObjectUtil } from './common/util/object.util';
import { ConfigService } from './services/config/config.service';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(
    private apiService: ApiService,
    private configService: ConfigService
  ) {}

  getTranslation(lang: string): Observable<Translation> {
    return this.configService.getConfig$().pipe(
      mergeMap((c) => {
        // use strings from config if present in selected language otherwise load from API
        if (c.language.recommended === lang && c.frontend_strings) {
          return of(c);
        } else {
          return this.apiService.getFrontendStrings({ language: lang });
        }
      }),
      map((r) => ObjectUtil.UnflattenObject(r.frontend_strings) as Translation)
    );
  }
}

export function translocoConfigFactory(configService: ConfigService) {
  const language = configService.getLanguage();
  const availableLanguages = configService.getAvailableLanguages();

  // APP_INITIALIZER should have initialized the languages, if they are not there something went wrong
  if (!language || !availableLanguages || availableLanguages.length === 0) {
    throw new Error('Language not initialized');
  }

  return translocoConfig({
    failedRetries: 0,
    reRenderOnLangChange: true,
    prodMode: !isDevMode(),
    defaultLang: language,
    availableLangs: availableLanguages,
    missingHandler: {
      useFallbackTranslation: false,
    },
  });
}
