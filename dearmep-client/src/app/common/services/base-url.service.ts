import { Injectable } from '@angular/core';
import { map, Observable, ReplaySubject } from 'rxjs';
import { UrlUtil } from '../util/url.util';

@Injectable({
  providedIn: 'root'
})
export class BaseUrlService {
  private readonly baseUrl$ = new ReplaySubject<string>()

  public setBaseUrl(url: string) {
    if (!UrlUtil.isAbsolute(url)) {
      throw new Error("BaseUrl must be absolute")
    }
    return this.baseUrl$.next(url)
  }

  public getBaseUrl$(): Observable<string> {
    return this.baseUrl$.asObservable()
  }

  public toAbsoluteUrl$(relativeUrl: string): Observable<string> {
    return this.baseUrl$.pipe(
      map(baseUrl => UrlUtil.toAbsolute(relativeUrl, baseUrl))
    )
  }
}
