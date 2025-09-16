// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpContextToken,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';

/**
 * Pass this token for requests that should be authenticated
 */
export const AUTH_TOKEN_REQUIRED = new HttpContextToken<boolean>(() => false);

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthenticationService);

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    if (request.context.get(AUTH_TOKEN_REQUIRED) === true) {
      return next.handle(
        request.clone({
          headers: request.headers.set('Authorization', `Bearer ${token}`),
        })
      );
    }

    return next.handle(request);
  }
}
