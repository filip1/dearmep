import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, Subject, delay, from, of, retry, retryWhen } from 'rxjs';

@Injectable()
export class RetryInterceptor implements HttpInterceptor {
  private readonly rateLimitMinRetryInterval = 1000
  private readonly rateLimitMaxRetries = 20

  private readonly serverErrorRetryInterval = 1000
  private readonly serverErrorMaxRetries = 5

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      retry({
        count: 3,
        resetOnSuccess: true,
        delay: (error: HttpErrorResponse, retryCount: number) => this.shouldRetry(error, retryCount)
      })
    );
  }

  private shouldRetry(error: HttpErrorResponse, retryCount: number): Observable<any> {
    const status: number = error.status

    if (status === 429) {
      return this.shouldRetryRateLimit(error, retryCount)
    } else if (status >= 500 && status < 600) {
      return this.shouldRetryServerError(error, retryCount)
    } else {
      return this.fail(error) // all other errors, such as 4xx => fail without retry
    }
  }

  private shouldRetryRateLimit(error: HttpErrorResponse, retryCount: number): Observable<any> {
    if (retryCount > this.rateLimitMaxRetries) {
      console.error(`Server-Rate-Limit encountered. Reached max retreis. Failing! (url: ${error.url}).`)
      return this.fail(error)
    }

    // retry interval is taken from retry-after header
    const retryAfterHeader = error.headers.get("retry-after")
    let retryAfter = parseFloat(retryAfterHeader || '') * 1000
    if (isNaN(retryAfter)) {
      retryAfter = this.rateLimitMinRetryInterval
    }
    const retryDelay = Math.max(retryAfter, this.rateLimitMinRetryInterval)

    console.error(`Server-Rate-Limit encountered. Retrying after ${retryDelay / 1000.0}s (url: ${error.url}).`)
    return this.reatryAfter(retryDelay)
  }

  private shouldRetryServerError(error: HttpErrorResponse, retryCount: number): Observable<any> {
    if (retryCount > this.serverErrorMaxRetries) {
      console.error(`Server-Error encountered. Reached max retreis. Failing! (url: ${error.url}).`)
      return this.fail(error)
    }

    console.error(`Server-Error encountered. Retrying after ${this.serverErrorRetryInterval / 1000.0}s (url: ${error.url}).`)
    return this.reatryAfter(this.serverErrorRetryInterval)
  }

  private reatryAfter(timeout: number): Observable<any> {
    return of(undefined).pipe(delay(timeout))
  }

  private fail(error: any): Observable<any> {
    return of(error)
  }
}
