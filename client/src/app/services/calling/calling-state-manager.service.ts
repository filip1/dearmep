import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CallingStep } from 'src/app/model/calling-step.enum';

@Injectable({
  providedIn: 'root'
})
export class CallingStateManagerService {
  private readonly step$ = new BehaviorSubject<CallingStep>(CallingStep.Home)

  public getStep$() {
    return this.step$.asObservable()
  }

  public goToVerify() {
    this.step$.next(CallingStep.Verify)
  }

  public goToSchedule() {
    this.step$.next(CallingStep.UpdateCallSchedule)
  }

  public setUpCall() {
    this.step$.next(CallingStep.Setup)
    setTimeout(() => {
      this.step$.next(CallingStep.Feedback)
    }, 5000);
  }

  public goHome() {
    this.step$.next(CallingStep.Home)
  }
}
