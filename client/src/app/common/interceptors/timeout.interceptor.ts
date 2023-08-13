import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError, timeout } from 'rxjs';

@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {
  private readonly requstTimeout = 10000

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      timeout(this.requstTimeout)
    );
  }
}
