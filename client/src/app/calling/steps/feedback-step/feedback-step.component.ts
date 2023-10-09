import { Component } from '@angular/core';
import { RoutingStateManagerService } from 'src/app/services/routing/routing-state-manager.service';
import { SelectDestinationService } from 'src/app/services/select-destination/select-destination.service';

@Component({
  selector: 'dmep-feedback-step',
  templateUrl: './feedback-step.component.html',
  styleUrls: ['./feedback-step.component.scss']
})
export class FeedbackStepComponent {
  constructor(
    private readonly routingStateManager: RoutingStateManagerService,
    private readonly selectDestinationService: SelectDestinationService,
  ) { }

  public submitClick() {
    this.selectDestinationService.renewSuggestedDestination()
    this.routingStateManager.returnHome()
  }
}
