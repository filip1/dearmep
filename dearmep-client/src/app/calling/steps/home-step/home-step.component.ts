import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'dmep-home-step',
  templateUrl: './home-step.component.html',
  styleUrls: ['./home-step.component.scss']
})
export class HomeStepComponent {
  constructor(
    private readonly router: Router,
  ) { }

  public onCallNowClick() {
    console.log("call now")
  }
}
