import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslocoService, flatten } from '@ngneat/transloco';
import { countries } from 'country-flag-icons';
import { Observable, Subject, combineLatest, count, filter, flatMap, forkJoin, map, mergeAll, mergeMap, shareReplay, takeUntil, tap } from 'rxjs';
import { nameof } from 'src/app/common/util/nameof';
import { L10nService } from 'src/app/services/l10n/l10n.service';
import { SelectDestinationService } from 'src/app/services/select-destination/select-destination.service';

interface Country {
  shortCode: string,
  name: string
}

@Component({
  selector: 'dmep-country-select',
  templateUrl: './country-select.component.html',
  styleUrls: ['./country-select.component.scss']
})
export class CountrySelectComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>()

  public countries$?: Observable<Country[]>

  public selectedCountry?: string

  constructor(
    private readonly l10nService: L10nService,
    private readonly translocoService: TranslocoService,
    private readonly selectDestinationService: SelectDestinationService,
  ) { }

  public ngOnInit(): void {
    this.countries$ = this.l10nService.getAvailableCountries$().pipe(
      takeUntil(this.destroyed$),
      filter(x => x && Array.isArray(x)),
      mergeMap(countryCodes =>
        combineLatest(countryCodes
          .map(countryCode => this.translocoService
            .selectTranslate(`countries.${countryCode}`)
            .pipe(
              map((countryName): Country => ({ shortCode: countryCode, name: countryName }))
      )))),
      tap(countries => countries.sort((a, b) => a.name.localeCompare(b.name))),
      shareReplay(),
    )

    this.l10nService.getCountry$().subscribe({
      next: (c) => this.selectedCountry = c || undefined
    })
  }

  public ngOnDestroy(): void {
    this.destroyed$.next()
    this.destroyed$.complete()
  }

  public onSelectCountry(country: string) {
    if (this.selectedCountry !== country) {
      this.l10nService.setCountry(country)
      this.selectDestinationService.renewSuggestedDestination(country)
      this.selectedCountry = country
    }
  }
}
