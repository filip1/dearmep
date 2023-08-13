import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, TimeoutError, delay, of, retry, throwError } from 'rxjs';

@Injectable()
export class RetryInterceptor implements HttpInterceptor {
  private readonly rateLimitMinRetryInterval = 1000
  private readonly rateLimitMaxRetries = 20

  private readonly serverErrorRetryInterval = 1000
  private readonly serverErrorMaxRetries = 5

  private readonly timeoutRetryInterval = 0
  private readonly timeoutMaxRetries = 3

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      retry({
        delay: (error: HttpErrorResponse, retryCount: number) => this.shouldRetry(error, retryCount)
      })
    );
  }

  private shouldRetry(error: any, retryCount: number): Observable<any> {
    const status: number = error.status

    if (status === 429) {
      return this.shouldRetryRateLimit(error, retryCount)
    } else if (status >= 500 && status < 600) {
      return this.shouldRetryServerError(error, retryCount)
    } else if (error.name === "TimeoutError") {
      return this.shouldRetryTimeout(error, retryCount)
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

  private shouldRetryTimeout(error: TimeoutError, retryCount: number): Observable<any> {
    if (retryCount > this.timeoutMaxRetries) {
      console.error(`Timeout-Error encountered. Reached max retreis. Failing!`)
      return this.fail(error)
    }

    console.error(`Timeout-Error encountered. Retrying after ${this.timeoutRetryInterval / 1000.0}s.`)
    return this.reatryAfter(this.timeoutRetryInterval)
  }

  private reatryAfter(timeout: number) {
    return of(undefined).pipe(delay(timeout))
  }

  private fail(error: any) {
    return throwError(() => error)
  }
}
