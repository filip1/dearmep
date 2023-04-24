import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { Country } from 'src/app/model/country.model';
import { nextTick } from 'src/app/testing/util/next-tick';

@Component({
  selector: 'dmep-country-select',
  templateUrl: './country-select.component.html',
  styleUrls: ['./country-select.component.scss']
})
export class CountrySelectComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>()

  public countries$?: Observable<Country[]>

  public countryFormControl = new FormControl<Country | null>(null)

  @Output()
  public selectionChanged = new EventEmitter<Country | null> 

  constructor(
    private readonly translocoService: TranslocoService,
  ) { }

  public ngOnInit(): void {
    this.countryFormControl.valueChanges
    .pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (v) => this.selectionChanged.next(v)
    })

    this.countries$ = this.translocoService.selectTranslateObject<{ [key: string]: string }>("countries").pipe(
      map((countries): Country[] =>
        Object
          .keys(countries)
          .map((shortCode): Country => ({ shortCode, name: countries[shortCode] }))
          .sort((a, b) => a.name.localeCompare(b.name))
      ),
      tap(async (countries) => { 
        // select default country, make dynamic later
        await nextTick()
        const defaultCountry = countries.find(c => c.shortCode === "AT")
        this.countryFormControl.setValue(defaultCountry ?? null)
      })
    )
  }

  public ngOnDestroy(): void {
    this.destroyed$.next()
    this.destroyed$.complete()
  }
}
