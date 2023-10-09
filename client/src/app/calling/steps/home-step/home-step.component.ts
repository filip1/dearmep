import { Component, Input } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { filter, map } from 'rxjs';
import { MarkupUtil } from 'src/app/common/util/markup.util';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { RoutingStateManagerService } from 'src/app/services/routing/routing-state-manager.service';

@Component({
  selector: 'dmep-home-step',
  templateUrl: './home-step.component.html',
  styleUrls: ['./home-step.component.scss']
})
export class HomeStepComponent {
  public descriptions$
  public isAuthenticated$
  public authenticatedNumberHtml$

  @Input()
  public disableScheduling = false

  constructor(
    private readonly routingStateManager: RoutingStateManagerService,
    private readonly translocoService: TranslocoService,
    private readonly authService: AuthenticationService,
  ) {
    this.descriptions$ = this.translocoService.selectTranslate('call.home.descriptions').pipe(
      filter(d => Array.isArray(d))
    )
    this.isAuthenticated$ = authService.isAuthenticated$()
    this.authenticatedNumberHtml$ = authService.getAuthenticatedNumber$().pipe(
      filter(n => typeof n === 'string'),
      map(n => MarkupUtil.NoWrap(n)),
    )
  }

  public onCallNowClick() {
    this.routingStateManager.callNow()
  }

  public onCallLaterClick() {
    this.routingStateManager.scheduleCall()
  }

  public onReauthenticateClick() {
    this.authService.logout()
  }
}
