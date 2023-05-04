import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, combineLatest, map, take } from 'rxjs';
import { ApiService } from 'src/app/api/services';
import { LocalStorageService } from '../local-storage/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class L10nPerferencesService {
  private readonly languageStorageKey = "language"
  private readonly countryStorageKey = "country"

  private readonly availableLanguages$ = new ReplaySubject<string[]>()
  private readonly detectedLanguage$ = new ReplaySubject<string | undefined>()
  private readonly userSelectedLanguage$ = new ReplaySubject<string | undefined>()

  private readonly availableCountries$ = new ReplaySubject<string[]>()
  private readonly detectedCountry$ = new ReplaySubject<string | undefined>()
  private readonly userSelectedCountry$ = new ReplaySubject<string | undefined>()

  constructor(
    private readonly apiService: ApiService,
    private readonly localStorageService: LocalStorageService,
  ) {
    this.init()
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

  public setLanguage(lang: string) {
    this.localStorageService.setString(this.languageStorageKey, lang)
    this.userSelectedLanguage$.next(lang)
  }

  private init() {
    this.loadUserSelectedLanguage()
    this.loadUserSelectedCountry()
    this.detectUserLocalizationViaAPI()
  }

  private loadUserSelectedLanguage() {
    const userSelectedLanguage = this.localStorageService.getString(this.languageStorageKey)
    this.userSelectedLanguage$.next(userSelectedLanguage || undefined)
  }

  private loadUserSelectedCountry() {
    const userSelectedCountry = this.localStorageService.getString(this.countryStorageKey)
    this.userSelectedCountry$.next(userSelectedCountry || undefined)
  }

  private detectUserLocalizationViaAPI() {
    this.apiService.localizeApiV1LocalizationGet().pipe(
      take(1),
    ).subscribe({
      next: (resp) => {
        this.detectedLanguage$.next(resp.language.recommended || undefined)
        this.detectedCountry$.next(resp.location.recommended || undefined)
        this.availableLanguages$.next(resp.language.available)
        this.availableCountries$.next(resp.location.available)
      }
    })
  }
}
