// SPDX-FileCopyrightText: © 2024 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { NgModule } from '@angular/core';
import { ConfigService } from '../services/config/config.service';
import { ApiService } from '../api/services';
import { LocalStorageService } from '../services/local-storage/local-storage.service';
import { testingConfig } from './testing-config';
import { Subject } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  exports: [HttpClientTestingModule, NoopAnimationsModule],
  providers: [
    {
      provide: ConfigService,
      useFactory: () => {
        const configService = new ConfigService(
          {
            getFrontendSetup: () => new Subject<unknown>(),
          } as unknown as ApiService,
          {
            setString: () => undefined,
            getString: () => null,
            prefixKey: (key: string) => key,
          } as unknown as LocalStorageService
        );
        configService.setConfig(testingConfig);
        return configService;
      },
    },
  ],
  imports: [HttpClientTestingModule, NoopAnimationsModule],
})
export class FixturesModule {}
