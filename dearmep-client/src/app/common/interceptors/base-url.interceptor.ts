import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { mergeMap, Observable } from 'rxjs';
import { BaseUrlService } from '../services/base-url.service';

/**
 * Detects requests to relative urls and prefixes them with a base-url
 */
@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {
  constructor(private readonly baseUrlService: BaseUrlService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // leave absolute urls unchanged
    if (this.isAbsoluteUrl(request.url)) {
      return next.handle(request);
    }

    // prefix relative urls
    return this.baseUrlService.getBaseUrl$().pipe(
      mergeMap(baseUrl =>
        next.handle(
          request.clone({ url: this.prefixUrl(baseUrl, request.url) })
        )
      )
    )
  }

  private isAbsoluteUrl(url: string): boolean {
    // Matches: "http://", "HTTPS://", "file://", "//", ...
    const absoluteUrlRegexp = /^([A-Za-z]+:\/\/|\/\/)/
    return !!url.match(absoluteUrlRegexp)
  }

  private prefixUrl(baseUrl: string, relativeUrl: string): string {
    return new URL(relativeUrl, baseUrl).toString()
  }
}
