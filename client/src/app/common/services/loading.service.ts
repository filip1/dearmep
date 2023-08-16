import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, debounceTime, delay, distinctUntilChanged, retry } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private readonly loading$ = new BehaviorSubject(false)

  constructor() { }

  public setLoading(isLoading: boolean) {
    this.loading$.next(isLoading)
  }

  public getLoading$(): Observable<boolean> {
    return this.loading$.pipe(
      distinctUntilChanged(),
    )
  }
}
