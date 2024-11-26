// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Pipe, PipeTransform } from '@angular/core';
import { BaseUrlService } from '../services/base-url.service';

@Pipe({
  name: 'toAbsolute',
  pure: true,
  standalone: true,
})
export class ToAbsolutePipe implements PipeTransform {
  constructor(private readonly baseUrlService: BaseUrlService) {}

  transform(
    url: string | undefined,
    type: 'asset' | 'api'
  ): string | undefined {
    if (!url) {
      return url;
    }
    if (type === 'asset') {
      return this.baseUrlService.toAbsoluteAssetUrl(url);
    } else {
      return this.baseUrlService.toAbsoluteAPIUrl(url);
    }
  }
}
