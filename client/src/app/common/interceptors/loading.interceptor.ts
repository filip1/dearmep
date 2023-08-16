import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private nextRequestID = 0;
  private inflightRequests = new Set<number>();

  constructor(private readonly loadingService: LoadingService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const requestID = this.getRequestID()
    this.requestStarted(requestID)

    return next
      .handle(request).pipe(
        tap({
          next: (e) => {
            if (e.type === 4) {
              this.requestFinished(requestID)
            }
          },
          error: () => this.requestFinished(requestID),
          unsubscribe: () => this.requestFinished(requestID),
        })
      );
  }

  private getRequestID(): number {
    const id = this.nextRequestID
    this.nextRequestID++
    return id
  }

  private requestStarted(requestID: number) {
    this.inflightRequests.add(requestID)
    this.updateLoadingService()
  }

  private requestFinished(requestID: number) {
    this.inflightRequests.delete(requestID)
    this.updateLoadingService()
  }

  private updateLoadingService() {
    this.loadingService.setLoading(this.inflightRequests.size !== 0)
  }
}
