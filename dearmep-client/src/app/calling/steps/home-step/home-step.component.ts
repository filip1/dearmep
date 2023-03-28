import { Component } from '@angular/core';

@Component({
  selector: 'dmep-home-step',
  templateUrl: './home-step.component.html',
  styleUrls: ['./home-step.component.scss']
})
export class HomeStepComponent {
  public onCallNowClick() {
    console.log("call now")
  }
}
