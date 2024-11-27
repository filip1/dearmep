// SPDX-FileCopyrightText: © 2024 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { environment } from 'src/environments/environment';
import { BaseUrlService } from './common/services/base-url.service';
import { UrlUtil } from './common/util/url.util';
import { ConfigService } from './services/config/config.service';

// It is required to set the api-url before the app is initialized
// otherwise the APP_INITIALIZER will be stuck trying to make a request
// this solves the chicken and egg problem.
function setApiUrl(baseUrlService: BaseUrlService) {
  const elements = document.getElementsByTagName(environment.dmepTagName);
  if (!elements || elements.length === 0) {
    throw Error(
      `<${environment.dmepTagName}></${environment.dmepTagName}> element not found`
    );
  }
  const hostAttr = elements[0].getAttribute('host');
  const apiAttr = elements[0].getAttribute('api') || '/';
  if (!hostAttr) {
    throw Error(
      `<${environment.dmepTagName}></${environment.dmepTagName}> is missing "host" attribute`
    );
  }
  const apiUrl = UrlUtil.toAbsolute(apiAttr, hostAttr);
  baseUrlService.setAPIUrl(apiUrl);
}

export function appInitializerFactory(
  configService: ConfigService,
  baseUrlService: BaseUrlService
): () => Promise<void> {
  return async () => {
    setApiUrl(baseUrlService);
    await configService.initialize();
  };
}
