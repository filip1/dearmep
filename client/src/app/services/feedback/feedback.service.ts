import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, map, tap, throwError } from 'rxjs';
import { FeedbackSubmission } from 'src/app/api/models';
import { ApiService } from 'src/app/api/services';
import { ErrorService } from '../error/error.service';
import { L10nService } from '../l10n/l10n.service';
import { SelectDestinationService } from '../select-destination/select-destination.service';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private readonly queryParamNames = [ 'dearmep_feedback_token', 'ft' ]

  private feedbackToken?: string

  constructor(
    private readonly apiService: ApiService,
    private readonly l10nService: L10nService,
    private readonly selectDestinationService: SelectDestinationService,
  ) {
    this.checkUrlFeedbackTokenPresent()
  }

  public setToken(token: string | undefined) {
    this.feedbackToken = token
  }

  public submitFeedback(feedback: FeedbackSubmission) {
    if (!this.feedbackToken) {
      return throwError(() => new Error("feedback token missing"))
    }
    return this.apiService.submitCallFeedback({
      token: this.feedbackToken,
      body: feedback,
    })
  }

  public loadFeedbackContext(): Observable<boolean> {
    if (!this.feedbackToken) {
      return throwError(() => new Error("feedback token missing"))
    }

    return this.apiService.getFeedbackContext({ token: this.feedbackToken }).pipe(
      tap(context => {
        if (context.used || context.expired) {
          return
        }

        const lang = context.language
        const destID = context.destination?.id

        if (lang) {
          this.l10nService.setLanguage(lang)
        }
        if (destID) {
          this.selectDestinationService.selectDestination(destID)
        }
      }),
      map(c => c.used || c.expired),
    )
  }

  /***
   * Checks if a feedback token is present in the url. If token is present, it is returned.
   *
   * The following url formats are supported (both query and hash parameters):
   * https://example.com/?dearmep_feedback_token=ABCDEFGH
   * https://example.com/#dearmep_feedback_token=ABCDEFGH
   * https://example.com/?ft=ABCDEFGH
   * https://example.com/#ft=ABCDEFGH
   *
   * Parameters are checked in the order specified above.
   */
  public checkUrlFeedbackTokenPresent(): string | undefined {
    const queryParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))

    for (const paramName of this.queryParamNames) {
      let token = queryParams.get(paramName)
      if (token) {
        return token
      }
      token = hashParams.get(paramName)
      if (token) {
        return token
      }
    }
    return undefined
  }
}
