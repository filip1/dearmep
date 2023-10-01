import { HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, mergeMap } from 'rxjs';
import { CallState, CallStateResponse, DestinationInCallResponse, OutsideHoursResponse, UserInCallResponse } from 'src/app/api/models';
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
      next: (callState) => {
        const result = this.handleCallState(callState)
        if (result.keepPolling) {
          this.watchCallState()
        }
      },
      error: (err: DestinationInCallResponse | UserInCallResponse | OutsideHoursResponse | unknown) => {
        // TODO: Handle error

        this.step$.next(CallingStep.Home)
      }
    })
  }

  public goToFeedback() {
    this.step$.next(CallingStep.Home)
  }

  public goHome() {
    this.step$.next(CallingStep.Home)
  }

  private watchCallState() {
    const subscription = interval(this.callStatePollInterval).pipe(
      mergeMap(() =>
        this.apiService.getCallState(undefined, new HttpContext().set(AUTH_TOKEN_REQUIRED, true))),
    ).subscribe({
      next: (callState) => {
        const result = this.handleCallState(callState)
        if (!result.keepPolling) {
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

  private handleCallState(callState: CallStateResponse): { keepPolling: boolean } {
    // NOTE: Explicitly listing all possible Enum-Values here and NOT adding default case or return statement after the switch!
    //  => This way the compiler fill force us to handle all enum values including any newly added status code that might pop up in the future
    // If any status code is not handled correctly this could easily lead to a bug where the polling goes on forever and the user
    // is never prompted for feedback.
    switch (callState.state) {
      case CallState.InMenu:
      case CallState.CallingDestination:
      case CallState.DestinationConnected:
      case CallState.FinishedCall:
      case CallState.FinishedShortCall:
        this.goToFeedback()
        return { keepPolling: false };
      case CallState.CallingUserFailed:
      case CallState.CallingDestinationFailed:
      case CallState.CallAborted:
      case CallState.NoCall:
        this.goHome()
        return { keepPolling: false };
      case CallState.CallingUser:
        return { keepPolling: true };
    }
  }
}
