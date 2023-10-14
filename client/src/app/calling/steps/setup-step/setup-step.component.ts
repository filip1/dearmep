import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest, filter, map, take } from 'rxjs';
import { CallState, DestinationInCallResponse, OutsideHoursResponse, UserInCallResponse } from 'src/app/api/models';
import { MarkupUtil } from 'src/app/common/util/markup.util';
import { TypedHttpError } from 'src/app/common/util/typed-http-error';
import { CallingErrorType, CallingService } from 'src/app/services/calling/calling.service';
import { ErrorService } from 'src/app/services/error/error.service';
import { L10nService } from 'src/app/services/l10n/l10n.service';
import { RoutingStateManagerService } from 'src/app/services/routing/routing-state-manager.service';
import { SelectDestinationService } from 'src/app/services/select-destination/select-destination.service';

@Component({
  selector: 'dmep-setup-step',
  templateUrl: './setup-step.component.html',
  styleUrls: ['./setup-step.component.scss']
})
export class SetupStepComponent implements OnInit {
  public readonly selectedDestinationNameHtml$

  constructor(
    private readonly selectDestinationService: SelectDestinationService,
    private readonly l10nService: L10nService,
    private readonly callingService: CallingService,
    private readonly routingStateManager: RoutingStateManagerService,
    private readonly errorService: ErrorService,
  ) {
    this.selectedDestinationNameHtml$ = selectDestinationService.getDestination$().pipe(
      map(d => d?.name),
      filter(n => typeof n === 'string'),
      map(n => MarkupUtil.NoWrap(n, 'dmep-nowrap dmep-bold'))
    )
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
        let errorDialogResult: Observable<void> | undefined

        if (err === CallState.CallingUserFailed) {
          errorDialogResult = this.errorService.displayErrorDialog('callSetup.error.failedToEstablishCall')
        } else if (err === CallState.CallingDestinationFailed) {
          errorDialogResult = this.errorService.displayErrorDialog('callSetup.error.failedToReachDestination')
        } else if ((err as TypedHttpError<DestinationInCallResponse | UserInCallResponse | OutsideHoursResponse>).error) {
          const httpError = (err as TypedHttpError<DestinationInCallResponse | UserInCallResponse | OutsideHoursResponse>).error
          if (httpError?.error === 'DESTINATION_IN_CALL') {
            errorDialogResult = this.errorService.displayErrorDialog('callSetup.error.failedToReachDestination')
          } else if (httpError?.error === 'USER_IN_CALL') {
            errorDialogResult = this.errorService.displayErrorDialog('callSetup.error.failedToEstablishCall')
          } else if (httpError?.error === 'OUTSIDE_HOURS') {
            errorDialogResult = this.errorService.displayErrorDialog('callSetup.error.outsideOfficeHours')
          } else {
            this.errorService.displayUnknownError(err)
          }
        } else {
          this.errorService.displayUnknownError(err)
        }

        if (errorDialogResult) {
          errorDialogResult.subscribe({
            next: () => {
              this.selectDestinationService.renewSuggestedDestination()
              this.routingStateManager.returnHome()
            }
          })
        }
      },
    })
  }
}
