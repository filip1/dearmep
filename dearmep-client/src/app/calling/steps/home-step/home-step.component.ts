import { Component } from '@angular/core';
import { CallingStateManagerService } from 'src/app/services/calling/calling-state-manager.service';

@Component({
  selector: 'dmep-home-step',
  templateUrl: './home-step.component.html',
  styleUrls: ['./home-step.component.scss']
})
export class HomeStepComponent { 
  constructor(
    private readonly callingStateManager: CallingStateManagerService,
  ) {}

  public onCallNowClick() {
    this.callingStateManager.goToVerify()
  }
}
