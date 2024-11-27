// SPDX-FileCopyrightText: © 2024 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
} from '@angular/core';
import { appInitializerFactory } from './app.initializer';
import { ConfigService } from './services/config/config.service';
import { BaseUrlService } from './common/services/base-url.service';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { AuthInterceptor } from './common/interceptors/auth.interceptor';
import { BaseUrlInterceptor } from './common/interceptors/base-url.interceptor';
import { RetryInterceptor } from './common/interceptors/retry.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { ApiModule } from './api/api.module';
import {
  TranslocoHttpLoader,
  translocoConfigFactory,
} from './transloco.providers';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ShadowRootOverlayContainer } from './common/material/shadow-root-overlay-container';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import {
  TRANSLOCO_CONFIG,
  TRANSLOCO_LOADER,
  TranslocoModule,
} from '@ngneat/transloco';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [ConfigService, BaseUrlService],
      multi: true,
    },

    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: BaseUrlInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: RetryInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true },

    { provide: OverlayContainer, useClass: ShadowRootOverlayContainer },
    {
      provide: MAT_ICON_DEFAULT_OPTIONS,
      useValue: { fontSet: 'material-icons-outlined' },
    },

    {
      provide: TRANSLOCO_CONFIG,
      useFactory: translocoConfigFactory,
      deps: [ConfigService],
    },
    { provide: TRANSLOCO_LOADER, useClass: TranslocoHttpLoader },

    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      ApiModule.forRoot({ rootUrl: '' }),
      TranslocoModule,
      BrowserAnimationsModule
    ),
  ],
};
