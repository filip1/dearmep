// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { FeedbackSubmission } from 'src/app/api/models';
import { ApiService } from 'src/app/api/services';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private feedbackToken?: string;

  constructor(private readonly apiService: ApiService) {}

  public setToken(token: string | undefined) {
    this.feedbackToken = token;
  }

  public submitFeedback(feedback: FeedbackSubmission) {
    if (!this.feedbackToken) {
      return throwError(() => new Error('feedback token missing'));
    }
    return this.apiService.submitCallFeedback({
      token: this.feedbackToken,
      body: feedback,
    });
  }
}
