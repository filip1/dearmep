import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { Subject, filter, takeUntil } from 'rxjs';
import { L10nService } from 'src/app/services/l10n/l10n.service';
import { SelectDestinationService } from 'src/app/services/select-destination/select-destination.service';

@Component({
  selector: 'dmep-country-select',
  templateUrl: './country-select.component.html',
  styleUrls: ['./country-select.component.scss']
})
export class CountrySelectComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>()

  public countries?: string[]

  public selectedCountry?: string

  constructor(
    private readonly l10nService: L10nService,
    private readonly translocoService: TranslocoService,
    private readonly selectDestinationService: SelectDestinationService,
  ) { }

  public ngOnInit(): void {
    this.l10nService.getAvailableCountries$().pipe(
      takeUntil(this.destroyed$),
    ).subscribe({
      next: (c) => {
        this.countries = c
        this.sortCountries()
      }
    })

    this.translocoService.events$.pipe(
      takeUntil(this.destroyed$),
      filter(e => e.type === 'langChanged' || e.type === 'translationLoadSuccess'),
    ).subscribe({
      next: () => this.sortCountries()
    })

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

  public getCountryTranslationKey(country: string): string {
    return `countries.${country}`
  }

  private sortCountries() {
    this.countries?.sort((a, b) => {
      const aTrans = this.translocoService.translate(this.getCountryTranslationKey(a))
      const bTrans = this.translocoService.translate(this.getCountryTranslationKey(b))
      return aTrans.localeCompare(bTrans)
    })

  }
}
