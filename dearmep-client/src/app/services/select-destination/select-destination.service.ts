import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/api/services';
import { L10nService } from '../l10n/l10n.service';
import { BehaviorSubject, Observable, distinct, distinctUntilChanged, filter, take } from 'rxjs';
import { DestinationRead } from 'src/app/api/models';

@Injectable({
  providedIn: 'root'
})
export class SelectDestinationService {
  private selectedCountry?: string
  private readonly selectedDestination = new BehaviorSubject<DestinationRead | undefined>(undefined)

  constructor(
    private readonly apiService: ApiService,
    private readonly l10nService: L10nService,
  ) {
    l10nService.getCountry$()
      .pipe(
        distinctUntilChanged(),
        filter(c => c !== undefined && c !== null)
      )
      .subscribe({
        next: (c) => {
          this.selectedCountry = c
          this.renewSuggestedDestination()
        }
      })
  }

  public getDestination$(): Observable<DestinationRead | undefined> {
    return this.selectedDestination.asObservable()
  }

  public renewSuggestedDestination() {
    this.apiService.getSuggestedDestination({ country: this.selectedCountry }).subscribe({
      next: (d) => this.selectedDestination.next(d),
    })
  }
}
