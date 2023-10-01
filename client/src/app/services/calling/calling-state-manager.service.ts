import { HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, mergeMap } from 'rxjs';
import { CallState, DestinationInCallResponse, OutsideHoursResponse, UserInCallResponse } from 'src/app/api/models';
import { ApiService } from 'src/app/api/services';
import { AUTH_TOKEN_REQUIRED } from 'src/app/common/interceptors/auth.interceptor';
import { SKIP_RETRY_STATUS_CODES } from 'src/app/common/interceptors/retry.interceptor';
import { CallingStep } from 'src/app/model/calling-step.enum';

@Injectable({
  providedIn: 'root'
})
export class CallingStateManagerService {
  private readonly callStatePollInterval = 5000

  private readonly step$ = new BehaviorSubject<CallingStep>(CallingStep.Home)

  public constructor(
    private readonly apiService: ApiService,
  ) { }

  public getStep$() {
    return this.step$.asObservable()
  }

  public goToVerify() {
    this.step$.next(CallingStep.Verify)
  }

  public goToSchedule() {
    this.step$.next(CallingStep.UpdateCallSchedule)
  }

  public setUpCall(destinationID: string, language: string) {
    this.step$.next(CallingStep.Setup)

    this.apiService.initiateCall({
      body: {
        destination_id: destinationID,
        language: language,
      }
    }, new HttpContext()
      .set(AUTH_TOKEN_REQUIRED, true)
      .set(SKIP_RETRY_STATUS_CODES, [ 503 ])
    ).subscribe({
      next: (response) => {
        this.monitorCallState()
      },
      error: (err: DestinationInCallResponse | UserInCallResponse | OutsideHoursResponse | unknown) => {
        // TODO: Handle error

        this.step$.next(CallingStep.Home)
      }
    })
  }

  public goHome() {
    this.step$.next(CallingStep.Home)
  }

  private monitorCallState() {
    const subscription = interval(this.callStatePollInterval).pipe(
      mergeMap(() =>
        this.apiService.getCallState(undefined, new HttpContext().set(AUTH_TOKEN_REQUIRED, true))),
    ).subscribe({
      next: (callState) => {
        // Go to feedback if user has made it at least to the menu or further
        if (callState.state === CallState.InMenu ||
          callState.state === CallState.CallingDestination ||
          callState.state === CallState.DestinationConnected ||
          callState.state === CallState.FinishedCall ||
          callState.state === CallState.FinishedShortCall) {
            this.step$.next(CallingStep.Feedback)
            subscription.unsubscribe()
        } else if (callState.state === CallState.CallingUserFailed || // Go home otherwise
          callState.state === CallState.CallingDestinationFailed ||
          callState.state === CallState.CallAborted ||
          callState.state === CallState.NoCall) {
            // TODO: display error message
            this.step$.next(CallingStep.Home)
            subscription.unsubscribe()
        }
      },
      error: (err) => {
        // TODO: display error message
        console.error(err)
        subscription.unsubscribe()
      }
    })
  }
}
