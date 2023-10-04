import { HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, mergeMap } from 'rxjs';
import { CallState, CallStateResponse, DestinationInCallResponse, OutsideHoursResponse, UserInCallResponse } from 'src/app/api/models';
import { ApiService } from 'src/app/api/services';
import { AUTH_TOKEN_REQUIRED } from 'src/app/common/interceptors/auth.interceptor';
import { SKIP_RETRY_STATUS_CODES } from 'src/app/common/interceptors/retry.interceptor';
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

  public goToVerify() {
    this.step$.next(CallingStep.Verify)
  }

  public goToSchedule() {
    this.step$.next(CallingStep.UpdateCallSchedule)
  }

  public goToFeedback() {
    this.step$.next(CallingStep.Home)
  }

  public goHome() {
    this.step$.next(CallingStep.Home)
  }
}
