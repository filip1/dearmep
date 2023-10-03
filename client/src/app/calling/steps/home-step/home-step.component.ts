import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@ngneat/transloco';
import { filter } from 'rxjs';
import { TitleComponent } from 'src/app/components/title/title.component';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { CallingStateManagerService } from 'src/app/services/calling/calling-state-manager.service';

@Component({
  selector: 'dmep-home-step',
  templateUrl: './home-step.component.html',
  styleUrls: ['./home-step.component.scss']
})
export class HomeStepComponent {
  public descriptions$
  public isAuthenticated$
  public authenticatedNumber$

  @Input()
  public disableScheduling = false

  constructor(
    private readonly callingStateManager: CallingStateManagerService,
    private readonly translocoService: TranslocoService,
    authService: AuthenticationService,
  ) {
    this.descriptions$ = this.translocoService.selectTranslate('call.home.descriptions').pipe(
      filter(d => Array.isArray(d))
    )
    this.isAuthenticated$ = authService.isAuthenticated$()
    this.authenticatedNumber$ = authService.getAuthenticatedNumber$()
  }

  public onCallNowClick() {
    this.callingStateManager.goToVerify()
  }

  public onCallLaterClick() {
    this.callingStateManager.goToSchedule()
  }

  public onReauthenticateClick() {
    this.callingStateManager.goToVerify()
  }
}
