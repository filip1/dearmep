// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Pipe, PipeTransform, inject } from '@angular/core';
import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
  SafeScript,
  SafeStyle,
  SafeUrl,
} from '@angular/platform-browser';

/**
 * Safe pipe marks srings as trusted to avoid angular warnings regarding XSS.
 *
 * This pipe must only ever be used with values that are 100% trustet e.g. configuration values.
 * It must never be used with values that originate from user input in any way.
 */
@Pipe({
  name: 'safe',
  pure: true,
  standalone: true,
})
export class SafePipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(
    value: string | undefined | null,
    type: string
  ):
    | SafeHtml
    | SafeStyle
    | SafeScript
    | SafeUrl
    | SafeResourceUrl
    | undefined
    | null {
    if (!value) {
      return value;
    }
    switch (type) {
      case 'html':
        return this.sanitizer.bypassSecurityTrustHtml(value);
      case 'style':
        return this.sanitizer.bypassSecurityTrustStyle(value);
      case 'script':
        return this.sanitizer.bypassSecurityTrustScript(value);
      case 'url':
        return this.sanitizer.bypassSecurityTrustUrl(value);
      case 'resourceUrl':
        return this.sanitizer.bypassSecurityTrustResourceUrl(value);
      default:
        throw new Error(`Unknonw type: '${type}'`);
    }
  }
}
