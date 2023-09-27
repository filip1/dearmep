import { Component } from '@angular/core';
import { CallingStateManagerService } from 'src/app/services/calling/calling-state-manager.service';

@Component({
  selector: 'dmep-feedback-step',
  templateUrl: './feedback-step.component.html',
  styleUrls: ['./feedback-step.component.scss']
})
export class FeedbackStepComponent {
  constructor(
    private readonly callingStateManager: CallingStateManagerService,
  ) { }

  public submitClick() {
    this.callingStateManager.goHome()
  }
}
