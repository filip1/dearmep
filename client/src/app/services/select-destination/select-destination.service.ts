import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/api/services';
import { L10nService } from '../l10n/l10n.service';
import { BehaviorSubject, Observable, distinctUntilChanged, filter } from 'rxjs';
import { DestinationRead, DestinationSearchResult } from 'src/app/api/models';

@Injectable({
  providedIn: 'root'
})
export class SelectDestinationService {
  private selectedCountry?: string
  private readonly selectedDestination = new BehaviorSubject<DestinationRead | undefined>(undefined)
  private readonly availableDestinations = new BehaviorSubject<DestinationSearchResult[] | undefined>(undefined)

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
          this.loadAvailableDestinations()
        }
      })
  }

  public getDestination$(): Observable<DestinationRead | undefined> {
    return this.selectedDestination.asObservable()
  }

  public getAvailableDestinations$(): Observable<DestinationSearchResult[] | undefined> {
    return this.availableDestinations.asObservable()
  }

  public renewSuggestedDestination() {
    this.apiService.getSuggestedDestination({ country: this.selectedCountry }).subscribe({
      next: (d) => this.selectedDestination.next(d),
    })
  }

  public selectDestination(destinationID: string) {
    this.apiService.getDestinationById({ id: destinationID }).subscribe({
      next: (d) => this.selectedDestination.next(d)
    })
  }

  private loadAvailableDestinations() {
    if (!this.selectedCountry) { return }
    this.apiService.getDestinationsByCountry({ country: this.selectedCountry }).subscribe({
      next: (d) => this.availableDestinations.next(d.results)
    })
  }
}
