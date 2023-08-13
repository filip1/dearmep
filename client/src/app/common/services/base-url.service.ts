import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable, ReplaySubject } from 'rxjs';
import { UrlUtil } from '../util/url.util';

/**
 * This service helps to convert urls that are supposed to be relative to the backend of this application
 * into absolute urls.
 * Since the brownsers behavior is to treate all relative urls as if they were referencing to the embedding
 * host-page it is necessary to convert relative urls to absolute using a configurable base-url.
 */
@Injectable({
  providedIn: 'root'
})
export class BaseUrlService {
  private readonly baseUrl$ = new BehaviorSubject<string | undefined>(undefined)
  private readonly assetsPath$ = new ReplaySubject<string>()

  /**
   * Sets the base-url that will be used as a base for converting relative urls
   */
  public setBaseUrl(url: string) {
    if (!url || url === "" || !UrlUtil.isAbsolute(url)) {
      throw new Error("BaseUrl must be absolute")
    }
    return this.baseUrl$.next(url)
  }

  public getBaseUrl$(): Observable<string> {
    return this.baseUrl$.pipe(
      filter(u => !!u),
    ) as Observable<string>
  }

  public toAbsoluteUrl$(relativeUrl: string): Observable<string> {
    if (UrlUtil.isAbsolute(relativeUrl)) {
      return new BehaviorSubject(relativeUrl)
    }

    return this.baseUrl$.pipe(
      filter(u => !!u),
      map(baseUrl => UrlUtil.toAbsolute(relativeUrl, baseUrl))
    )
  }

  public toAbsoluteUrl(relativeUrl: string): string {
    if (UrlUtil.isAbsolute(relativeUrl)) {
      return relativeUrl
    }

    return UrlUtil.toAbsolute(relativeUrl, this.baseUrl$.value)
  }
}
