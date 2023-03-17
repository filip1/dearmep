import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BaseUrlService {
  private readonly baseUrl$ = new ReplaySubject<string>()

  public setBaseUrl(url: string) {
    return this.baseUrl$.next(url)
  }

  public getBaseUrl$(): Observable<string> {
    return this.baseUrl$.asObservable()
  }
}
