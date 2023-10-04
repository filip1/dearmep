import { Component, OnDestroy, OnInit } from '@angular/core';
import { nextDay } from 'date-fns';
import { Subject, combineLatest, filter, merge, mergeMap, take, takeUntil } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { CallingErrorType, CallingService } from 'src/app/services/calling/calling.service';
import { L10nService } from 'src/app/services/l10n/l10n.service';
import { RoutingStateManagerService } from 'src/app/services/routing/routing-state-manager.service';
import { SelectDestinationService } from 'src/app/services/select-destination/select-destination.service';

@Component({
  selector: 'dmep-setup-step',
  templateUrl: './setup-step.component.html',
  styleUrls: ['./setup-step.component.scss']
})
export class SetupStepComponent implements OnInit {
  public readonly selectedDestination$

  constructor(
    private readonly selectDestinationService: SelectDestinationService,
    private readonly l10nService: L10nService,
    private readonly callingService: CallingService,
    private readonly routingStateManager: RoutingStateManagerService,
  ) {
    this.selectedDestination$ = selectDestinationService.getDestination$()
  }

  public ngOnInit(): void {
    combineLatest([
      this.selectDestinationService.getDestination$(),
      this.l10nService.getLanguage$(),
    ]).pipe(
      filter(([dest, lang]) => !!dest && !!lang),
      take(1),
    ).subscribe({
      next: ([dest, lang]) => {
        if (!dest || !lang) { return }
        this.initiateCall(dest.id, lang)
      }
    })
  }

  private initiateCall(destinationID: string, language: string) {
    this.callingService.setUpCall(destinationID, language).pipe(
      take(1),
    ).subscribe({
      next: () => { this.routingStateManager.goToFeedback() },
      error: (err: CallingErrorType) => {
        // TODO
        console.error(err)
      },
    })
  }
}
