import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, combineLatest, distinctUntilKeyChanged, filter, map, shareReplay, take } from 'rxjs';
import { ApiService } from 'src/app/api/services';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { TranslocoService } from '@ngneat/transloco';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class L10nService {
  private readonly defaultCountry$ = new ReplaySubject<string | undefined>()

  private readonly availableLanguages$: Observable<string[]>
  private readonly detectedLanguage$: Observable<string | undefined>
  private readonly userSelectedLanguage$: BehaviorSubject<string | undefined>

  private readonly availableCountries$: Observable<string[]>
  private readonly detectedCountry$: Observable<string | undefined>
  private readonly userSelectedCountry$: BehaviorSubject<string | undefined>

  private readonly randomCountry$: Observable<string>
  private readonly country$: Observable<string>

  constructor(
    private readonly configService: ConfigService,
    private readonly translocoService: TranslocoService,
  ) {
    this.userSelectedLanguage$ = new BehaviorSubject<string | undefined>(undefined)
    this.userSelectedCountry$ = new BehaviorSubject<string | undefined>(undefined)

    this.detectedCountry$ = this.configService.getConfig$().pipe(map(c => c.location.country))
    this.detectedLanguage$ = this.configService.getConfig$().pipe(map(c => c.language.recommended))

    this.availableCountries$ = this.configService.getConfig$().pipe(map(c => c.location.available))
    this.availableLanguages$ = this.configService.getConfig$().pipe(map(c => c.language.available))

    this.getLanguage$().subscribe({
      next(lang) { if (lang) { translocoService.setActiveLang(lang) } }
    })

    this.randomCountry$ = this.availableCountries$.pipe(
      filter(c => c?.length > 0),
      distinctUntilKeyChanged("length"),
      map((c) => c[Math.floor(c.length * Math.random())]),
      shareReplay(),
    )

    this.country$ = combineLatest([
      this.userSelectedCountry$,
      this.detectedCountry$,
      this.defaultCountry$,
      this.randomCountry$,
      this.availableCountries$,
    ]).pipe(
      map(([userSelectedCountry, apiDetectedCountry, defaultCountry, randomCountry, availableCountries]) => {
        return this.mustBePartOf(userSelectedCountry, availableCountries)
          || apiDetectedCountry
          || this.mustBePartOf(defaultCountry, availableCountries)
          || randomCountry
      }),
      shareReplay(),
    )
  }

  public getAvailableLanguages$(): Observable<string[]> {
    return this.availableLanguages$
  }

  public getLanguage$(): Observable<string | undefined> {
    return combineLatest([
      this.userSelectedLanguage$,
      this.detectedLanguage$,
      this.availableLanguages$,
    ]).pipe(
      map(([userSelectedLang, apiDetectedLang, availableLanguages]) => {
        return this.mustBePartOf(userSelectedLang, availableLanguages) || apiDetectedLang
      })
    )
  }

  public setLanguage(langCode: string) {
    this.configService.setSelectedLanguage(langCode)
    this.userSelectedLanguage$.next(langCode)
  }

  public getCountry$(): Observable<string> {
    return this.country$;
  }

  public getAvailableCountries$(): Observable<string[]> {
    return this.availableCountries$
  }

  public setCountry(country: string) {
    this.configService.setSelectedCountry(country)
    this.userSelectedCountry$.next(country)
  }

  public setDefaultCountry(country: string | undefined) {
    this.defaultCountry$.next(country)
  }

  private mustBePartOf(item: string | undefined, items: string[]): string | undefined {
    if (item !== undefined && items.indexOf(item) !== -1) {
      return item
    }
    return undefined
  }
}
