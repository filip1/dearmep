import { Injectable } from '@angular/core';
import { map, Observable, ReplaySubject } from 'rxjs';
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
  private readonly baseUrl$ = new ReplaySubject<string>()
  private readonly assetsPath$ = new ReplaySubject<string>()

  /**
   * Sets the base-url that will be used as a base for converting relative urls
   */
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
