import { Injectable } from '@angular/core';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { JwtResponse } from 'src/app/api/models';
import { addSeconds, isAfter } from 'date-fns';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private readonly tokenStorageKey = "auth-token"
  private readonly tokenTypeStorageKey = "auth-token-type"
  private readonly tokenExpiryTimeStorageKey = "auth-token-expiry-time"

  private readonly token$ = new BehaviorSubject<string | undefined>(undefined)
  private readonly tokenExpiryTime$ = new BehaviorSubject<Date | undefined>(undefined)

  constructor(
    private readonly localStorageService: LocalStorageService,
  ) {
    this.loadTokens()
  }

  public setToken(jwtResponse: JwtResponse) {
    const expiryTime = addSeconds(new Date(), jwtResponse.expires_in)

    this.localStorageService.setString(this.tokenStorageKey, jwtResponse.access_token)
    this.localStorageService.setString(this.tokenTypeStorageKey, jwtResponse.token_type)
    this.localStorageService.setString(this.tokenExpiryTimeStorageKey, expiryTime.toISOString())

    this.token$.next(jwtResponse.access_token)
  }

  private loadTokens() {
    const token = this.localStorageService.getString(this.tokenStorageKey)
    const tokenType = this.localStorageService.getString(this.tokenTypeStorageKey)
    const expiryTimeStr = this.localStorageService.getString(this.tokenExpiryTimeStorageKey)

    if (!token || !tokenType || !expiryTimeStr) {
      return
    }

    const expiryTime = new Date(expiryTimeStr)
    if (this.isExpired(expiryTime)) {
      this.deleteTokens()
      return
    }

    this.token$.next(token)
    this.tokenExpiryTime$.next(expiryTime)
  }

  private deleteTokens() {
    this.localStorageService.setString(this.tokenStorageKey, undefined)
    this.localStorageService.setString(this.tokenTypeStorageKey, undefined)
    this.localStorageService.setString(this.tokenExpiryTimeStorageKey, undefined)

    this.token$.next(undefined)
    this.tokenExpiryTime$.next(undefined)
  }

  private isExpired(expiryTime: Date): boolean {
    return isAfter(expiryTime, new Date())
  }
}
