import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { L10nService } from 'src/app/services/l10n/l10n.service';

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
  ) { }

  public ngOnInit(): void {
    this.l10nService.getAvailableCountries$().pipe(
      takeUntil(this.destroyed$),
    ).subscribe({
      next: (c) => {
        this.countries = c
        // Timeout (0ms) in order to make sure the language options are rendered to HTML before
        // setting the value of the mat-select input because of rendering issues if this order
        // is not correct.
        setTimeout(() => {
          this.getSelectedCountry()
        }, 0);
      }
    })
  }

  public ngOnDestroy(): void {
    this.destroyed$.next()
    this.destroyed$.complete()
  }

  public onSelectCountry(country: string) {
    this.selectedCountry = country
    this.l10nService.setCountry(country)
  }

  public getSelectedCountry() {
    this.l10nService.getCountry$().subscribe({
      next: (c) => this.selectedCountry = c
    })
  }
}
