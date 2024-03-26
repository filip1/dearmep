import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { FeedbackConvinced } from 'src/app/api/models';
import { ErrorService } from 'src/app/services/error/error.service';
import { FeedbackService } from 'src/app/services/feedback/feedback.service';
import { RoutingStateManagerService } from 'src/app/services/routing/routing-state-manager.service';
import { SelectDestinationService } from 'src/app/services/select-destination/select-destination.service';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'dmep-feedback-step',
  templateUrl: './feedback-step.component.html',
  styleUrls: ['./feedback-step.component.scss'],
  standalone: true,
  imports: [
    TranslocoModule,
    MatRadioGroup,
    ReactiveFormsModule,
    MatRadioButton,
    MatCheckbox,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
  ],
})
export class FeedbackStepComponent {
  public readonly convincedYes = FeedbackConvinced.Yes;
  public readonly convincedLikeleyYes = FeedbackConvinced.LikelyYes;
  public readonly convincedLikeleyNo = FeedbackConvinced.LikelyNo;
  public readonly convincedNo = FeedbackConvinced.No;

  public readonly formGroup = new FormGroup({
    convinced: new FormControl<FeedbackConvinced | undefined>(undefined, {
      updateOn: 'change',
    }),
    technicalProblems: new FormControl<boolean>(false, { updateOn: 'change' }),
    additionalFeedback: new FormControl<string | undefined>(undefined, {
      updateOn: 'change',
    }),
  });

  constructor(
    private readonly routingStateManager: RoutingStateManagerService,
    private readonly selectDestinationService: SelectDestinationService,
    private readonly feedbackService: FeedbackService,
    private readonly errorService: ErrorService
  ) {}

  public async submitClick() {
    this.feedbackService
      .submitFeedback({
        convinced: this.formGroup.value.convinced || undefined,
        technical_problems: this.formGroup.value.technicalProblems || undefined,
        additional: this.formGroup.value.additionalFeedback || undefined,
      })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.selectDestinationService.renewSuggestedDestination();
          this.routingStateManager.returnHome();
        },
        error: err => {
          this.errorService.displayUnknownError(err);
        },
      });
  }

  public skipClick() {
    this.selectDestinationService.renewSuggestedDestination();
    this.routingStateManager.returnHome();
  }
}
