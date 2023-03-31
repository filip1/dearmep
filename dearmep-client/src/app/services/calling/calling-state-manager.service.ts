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
}
