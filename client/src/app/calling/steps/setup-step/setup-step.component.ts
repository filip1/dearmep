import { Component } from '@angular/core';
import { SelectDestinationService } from 'src/app/services/select-destination/select-destination.service';

@Component({
  selector: 'dmep-setup-step',
  templateUrl: './setup-step.component.html',
  styleUrls: ['./setup-step.component.scss']
})
export class SetupStepComponent {
  public selectedDestination$

  constructor(selectDestinationService: SelectDestinationService) {
    this.selectedDestination$ = selectDestinationService.getDestination$()
  }
}
