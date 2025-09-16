// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Observable,
  concat,
  filter,
  interval,
  map,
  mergeMap,
  take,
  tap,
} from 'rxjs';
import {
  CallState,
  CallStateResponse,
  DestinationInCallResponse,
  OutsideHoursResponse,
  UserInCallResponse,
} from 'src/app/api/models';
import { ApiService } from 'src/app/api/services';
import { AUTH_TOKEN_REQUIRED } from 'src/app/common/interceptors/auth.interceptor';
import { SKIP_RETRY_STATUS_CODES } from 'src/app/common/interceptors/retry.interceptor';
import { TypedHttpError } from 'src/app/common/util/typed-http-error';
import { FeedbackService } from '../feedback/feedback.service';

export type CallingErrorType =
  | CallState.CallingUserFailed
  | CallState.CallingDestinationFailed
  | CallState.CallAborted
  | TypedHttpError<
      DestinationInCallResponse | UserInCallResponse | OutsideHoursResponse
    >
  | unknown;

@Injectable({
  providedIn: 'root',
})
export class CallingService {
  private readonly apiService = inject(ApiService);
  private readonly feedbackService = inject(FeedbackService);

  private readonly callStatePollInterval = 5000;

  public setUpCall(destinationID: string, language: string): Observable<void> {
    return concat(
      this.initiateCall(destinationID, language).pipe(
        take(1),
        tap(resp => this.feedbackService.setToken(resp.feedback_token)),
        map(resp => resp.state)
      ),
      this.watchCallState()
    ).pipe(
      filter(state => state !== CallState.CallingUser), // Poll call-status until user picks up the phone or error occurs
      take(1),
      map(state => {
        if (this.isError(state)) {
          throw new Error(state);
        }
      })
    );
  }

  private initiateCall(
    destinationID: string,
    language: string
  ): Observable<CallStateResponse> {
    return this.apiService.initiateCall(
      {
        body: {
          destination_id: destinationID,
          language: language,
        },
      },
      new HttpContext()
        .set(AUTH_TOKEN_REQUIRED, true)
        .set(SKIP_RETRY_STATUS_CODES, [503])
    );
  }

  private watchCallState(): Observable<CallState> {
    return interval(this.callStatePollInterval).pipe(
      mergeMap(() =>
        this.apiService.getCallState(
          {},
          new HttpContext().set(AUTH_TOKEN_REQUIRED, true)
        )
      ),
      map(response => response.state)
    );
  }

  private isError(callState: CallState): boolean {
    // NOTE: Explicitly listing all possible Enum-Values here and NOT adding default case or return statement after the switch!
    //  => This way the compiler fill force us to handle all enum values including any newly added status code that might pop up in the future
    // If any status code is not handled correctly this could easily lead to a bug where the polling goes on forever and the user
    // is never prompted for feedback.
    switch (callState) {
      case CallState.InMenu:
      case CallState.CallingDestination:
      case CallState.DestinationConnected:
      case CallState.FinishedCall:
      case CallState.FinishedShortCall:
      case CallState.CallingUser:
        return false;
      case CallState.CallingUserFailed:
      case CallState.CallingDestinationFailed:
      case CallState.CallAborted:
      case CallState.NoCall: // NoCall is seen as error in the context of trying to make a call
        // this could happen if the backend has restarted unexpectedly and
        // has no idea about the ongoing call
        return true;
    }
  }
}
