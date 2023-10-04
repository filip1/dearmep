import { Component } from '@angular/core';
import { RoutingStateManagerService } from 'src/app/services/routing/routing-state-manager.service';

@Component({
  selector: 'dmep-feedback-step',
  templateUrl: './feedback-step.component.html',
  styleUrls: ['./feedback-step.component.scss']
})
export class FeedbackStepComponent {
  constructor(
    private readonly routingStateManager: RoutingStateManagerService,
  ) { }

  public submitClick() {
    this.routingStateManager.goHome()
  }
}
