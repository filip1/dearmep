import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { combineLatest, debounceTime, distinctUntilChanged, filter, map, Observable, shareReplay, startWith, switchMap } from 'rxjs';
import { DestinationRead, DestinationSearchResult } from 'src/app/api/models';
import { CallingStep } from 'src/app/model/calling-step.enum';
import { CallingStateManagerService } from 'src/app/services/calling/calling-state-manager.service';
import { SelectDestinationService } from 'src/app/services/select-destination/select-destination.service';

@Component({
  selector: 'dmep-select-mep',
  templateUrl: './select-mep.component.html',
  styleUrls: ['./select-mep.component.scss']
})
export class SelectMEPComponent implements OnInit {
  public mepSelectionPossible$?: Observable<boolean>

  public selectedMEP$?: Observable<DestinationRead | undefined>
  public availableMEPs$?: Observable<DestinationSearchResult[] | undefined>
  public filteredMEPs?: Observable<DestinationSearchResult[] | undefined>

  public searchMEPFormControl = new FormControl<DestinationSearchResult | string | undefined>(undefined)

  constructor(
    private readonly callingStepManagerService: CallingStateManagerService,
    private readonly selectDestinationService: SelectDestinationService,
  ) { }

  public ngOnInit(): void {
    this.mepSelectionPossible$ = this.callingStepManagerService.getStep$().pipe(
      map(step => step !== CallingStep.Setup && step !== CallingStep.Feedback && step !== CallingStep.UpdateCallSchedule)
    )
    this.selectedMEP$ = this.selectDestinationService.getDestination$()
    this.availableMEPs$ = this.selectDestinationService.getAvailableDestinations$()

    // filter search options
    // this.filteredMEPs = combineLatest([
    //   this.selectDestinationService.getAvailableDestinations$(),
    //   this.searchMEPFormControl.valueChanges.pipe(startWith(undefined)),
    // ]).pipe(
    //   map(([availableMEPs, searchFieldValue]) => {
    //     return availableMEPs?.filter(m => this.mepMatchesSearchStr(m, searchFieldValue)) || []
    //   }),
    //   shareReplay()
    // )

    const destinationsFromSameCountry$ = this.selectDestinationService.getAvailableDestinations$()

    this.filteredMEPs = this.searchMEPFormControl.valueChanges.pipe(
      debounceTime(500),
      startWith(undefined),
      distinctUntilChanged(),
      switchMap((query) => {
        if (!query || typeof query === 'object') {
          return destinationsFromSameCountry$;
        } else {
          return this.selectDestinationService.searchDestination(query).pipe(map(r => r.results))
        }
      }),
      shareReplay()
    )

    // set selected mep from serach field
    this.searchMEPFormControl.valueChanges.pipe(
      filter(v => !!v && typeof v === 'object'),
      map(v => v as DestinationSearchResult)
    ).subscribe({
      next: (v) => this.selectDestinationService.selectDestination(v.id)
    })

    // reset search field if selected mep is not available in selected country
    destinationsFromSameCountry$.subscribe({
      next: (availableMEPs) => {
        const searchFieldValue = this.searchMEPFormControl.value
        if (searchFieldValue && typeof searchFieldValue === "object") {
          const found = !!availableMEPs?.find((m) => m.id === searchFieldValue?.id)
          if (!found) {
            this.searchMEPFormControl.reset()
          }
        }
      }
    })
  }

  public renewSuggestion() {
    this.searchMEPFormControl.reset()
    this.selectDestinationService.renewSuggestedDestination()
  }

  public getMepName(mep: DestinationSearchResult): string {
    return mep?.name || ''
  }

  public mepMatchesSearchStr(mep: DestinationSearchResult, searchValue: DestinationSearchResult | string | null | undefined): boolean {
    if (!searchValue) {
      return true
    }

    // match search string
    if (typeof searchValue === "string") {
      return mep.name.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1
    }

    return true
  }
}
