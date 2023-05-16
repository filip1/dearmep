import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, combineLatest, map, take } from 'rxjs';
import { ApiService } from 'src/app/api/services';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({
  providedIn: 'root'
})
export class L10nService {
  private readonly languageStorageKey = "language"
  private readonly countryStorageKey = "country"

  private readonly availableLanguages$ = new ReplaySubject<string[]>()
  private readonly detectedLanguage$ = new ReplaySubject<string | undefined>()
  private readonly userSelectedLanguage$: BehaviorSubject<string | undefined>

  private readonly availableCountries$ = new ReplaySubject<string[]>()
  private readonly detectedCountry$ = new ReplaySubject<string | undefined>()
  private readonly userSelectedCountry$: BehaviorSubject<string | undefined>

  constructor(
    private readonly apiService: ApiService,
    private readonly localStorageService: LocalStorageService,
    private readonly translocoService: TranslocoService,
  ) {
    this.userSelectedLanguage$ = new BehaviorSubject<string | undefined>(this.getStoredUserSelectedLanguage())
    this.userSelectedCountry$ = new BehaviorSubject<string | undefined>(this.getStoredUserSelectedCountry())
    this.detectUserLocalizationViaAPI()
    this.getLanguage$().subscribe({
      next(lang) { if (lang) { translocoService.setActiveLang(lang) } }
    })
  }

  public getAvailableLanguages$(): Observable<string[]> {
    return this.availableLanguages$.asObservable()
  }

  public getLanguage$(): Observable<string | undefined> {
    return combineLatest([
      this.userSelectedLanguage$,
      this.detectedLanguage$,
    ]).pipe(
      map(([userSelectedLang, apiDetectedLang]) => {
        return userSelectedLang || apiDetectedLang
      })
    )
  }

  public setLanguage(langCode: string) {
    this.localStorageService.setString(this.languageStorageKey, langCode)
    this.userSelectedLanguage$.next(langCode)
  }

  public getCountry$(): Observable<string | undefined> {
    return combineLatest([
      this.userSelectedCountry$,
      this.detectedCountry$,
    ]).pipe(
      map(([userSelectedCountry, apiDetectedCountry]) => {
        return userSelectedCountry || apiDetectedCountry
      })
    )
  }

  public getAvailableCountries$(): Observable<string[]> {
    return this.availableCountries$.asObservable()
  }

  public setCountry(countryCode: string) {
    this.localStorageService.setString(this.countryStorageKey, countryCode)
    this.userSelectedCountry$.next(countryCode)
  }

  private getStoredUserSelectedLanguage(): string | undefined {
    return this.localStorageService.getString(this.languageStorageKey) || undefined
  }

  private getStoredUserSelectedCountry(): string | undefined {
    return this.localStorageService.getString(this.countryStorageKey) || undefined
  }

  private detectUserLocalizationViaAPI() {
    this.apiService.getLocalization().pipe(
      take(1),
    ).subscribe({
      next: (resp) => {
        this.detectedLanguage$.next(resp.language.recommended || undefined)
        this.detectedCountry$.next(resp.location.recommended || undefined)
        this.availableLanguages$.next(resp.language.available)
        this.availableCountries$.next(resp.location.available?.map(c => c.toUpperCase()))
        this.translocoService.setAvailableLangs(resp.language.available)
      }
    })
  }
}
