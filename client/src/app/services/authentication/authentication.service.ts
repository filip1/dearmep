import { Injectable } from '@angular/core';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { JwtResponse } from 'src/app/api/models';
import { addSeconds, differenceInMilliseconds, isAfter, subMilliseconds } from 'date-fns';
import { BehaviorSubject, Observable, ReplaySubject, combineLatest, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private readonly tokenStorageKey = "auth-token"
  private readonly tokenTypeStorageKey = "auth-token-type"
  private readonly tokenExpiryTimeStorageKey = "auth-token-expiry-time"

  private readonly tokenExpiryMargin = 1000 // Token is treated as expired a short time before actual expiry

  private readonly token$ = new BehaviorSubject<string | undefined>(undefined)
  private readonly tokenExpiryTime$ = new BehaviorSubject<Date | undefined>(undefined)
  private readonly tokenExpiryTick$ = new ReplaySubject<void>()

  constructor(
    private readonly localStorageService: LocalStorageService,
  ) {
    this.loadTokens()
  }

  public setToken(jwtResponse: JwtResponse) {
    const expiryTime = addSeconds(new Date(), jwtResponse.expires_in)

    this.token$.next(jwtResponse.access_token)
    this.tokenExpiryTime$.next(expiryTime)

    this.localStorageService.setString(this.tokenStorageKey, jwtResponse.access_token)
    this.localStorageService.setString(this.tokenTypeStorageKey, jwtResponse.token_type)
    this.localStorageService.setString(this.tokenExpiryTimeStorageKey, expiryTime.toISOString())

    this.setExpiryTick(expiryTime)
  }

  public logout() {
    this.deleteTokens()
  }

  public getToken(): string | undefined {
    this.checkExpired()
    return this.token$.value
  }

  public isAuthenticated$(): Observable<boolean> {
    return combineLatest([
      this.token$,
      this.tokenExpiryTime$,
      this.tokenExpiryTick$,
    ]).pipe(
      map(([ token, tokenExpiryTime ]) => !!token && !!tokenExpiryTime && !this.isExpired(tokenExpiryTime))
    )
  }

  public isAuthenticated() {
    return this.token$.value && this.tokenExpiryTime$.value && !this.isExpired(this.tokenExpiryTime$.value)
  }

  private loadTokens() {
    const token = this.localStorageService.getString(this.tokenStorageKey)
    const expiryTimeStr = this.localStorageService.getString(this.tokenExpiryTimeStorageKey)

    if (!token || !expiryTimeStr) {
      return
    }

    const expiryTime = new Date(expiryTimeStr)
    if (this.isExpired(expiryTime)) {
      this.deleteTokens()
      return
    }

    this.token$.next(token)
    this.tokenExpiryTime$.next(expiryTime)

    this.setExpiryTick(expiryTime)
  }

  private deleteTokens() {
    this.token$.next(undefined)
    this.tokenExpiryTime$.next(undefined)

    this.localStorageService.setString(this.tokenStorageKey, undefined)
    this.localStorageService.setString(this.tokenTypeStorageKey, undefined)
    this.localStorageService.setString(this.tokenExpiryTimeStorageKey, undefined)
  }

  private checkExpired() {
    if (this.token$.value && this.tokenExpiryTime$.value && this.isExpired(this.tokenExpiryTime$.value)) {
      this.deleteTokens()
    }
  }

  private setExpiryTick(expiryTime: Date) {
    const timeUntilExpiry = differenceInMilliseconds(expiryTime, new Date())
    console.log("diff", timeUntilExpiry)
    setTimeout(() => {
      this.tokenExpiryTick$.next()
    }, timeUntilExpiry);
  }

  private isExpired(expiryTime: Date): boolean {
    return isAfter(subMilliseconds(expiryTime, this.tokenExpiryMargin), new Date())
  }
}
