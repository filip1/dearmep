import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CallingStep } from 'src/app/model/calling-step.enum';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class RoutingStateManagerService {
  private readonly step$ = new BehaviorSubject<CallingStep>(CallingStep.Home)

  public constructor(
    private readonly authService: AuthenticationService,
  ) { }

  public getStep$() {
    return this.step$.asObservable()
  }

  public callNow() {
    if (!this.authService.isAuthenticated()) {
      this.goToVerify()
    } else {
      this.step$.next(CallingStep.Setup)
    }
  }

  public scheduleCall() {
    if (!this.authService.isAuthenticated()) {
      this.goToVerify()
    } else {
      this.step$.next(CallingStep.UpdateCallSchedule)
    }
  }

  public goToFeedback() {
    this.step$.next(CallingStep.Feedback)
  }

  public returnHome() {
    this.step$.next(CallingStep.Home)
  }

  private goToVerify() {
    this.step$.next(CallingStep.Verify)
  }
}
