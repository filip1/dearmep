import { Component, Input } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { filter, map, take } from 'rxjs';
import { MarkupUtil } from 'src/app/common/util/markup.util';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { OfficeHoursService } from 'src/app/services/office-hours/office-hours.service';
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
  public officeHoursText$
  public officeHoursPopoverOpen = false
  public isOfficeHours$
  public officeHoursTimezone


  @Input()
  public disableScheduling = false

  constructor(
    private readonly routingStateManager: RoutingStateManagerService,
    private readonly translocoService: TranslocoService,
    private readonly authService: AuthenticationService,
    private readonly officeHoursService: OfficeHoursService,
  ) {
    this.descriptions$ = this.translocoService.selectTranslate('call.home.descriptions').pipe(
      filter(d => Array.isArray(d))
    )
    this.isAuthenticated$ = authService.isAuthenticated$()
    this.authenticatedNumberHtml$ = authService.getAuthenticatedNumber$().pipe(
      filter(n => typeof n === 'string'),
      map(n => MarkupUtil.NoWrap(n, 'dmep-nowrap dmep-bold')),
    )
    this.officeHoursText$ = this.officeHoursService.getOfficeHoursText$()
    this.isOfficeHours$ = this.officeHoursService.inOfficeHours$()
    this.officeHoursTimezone = this.officeHoursService.getOfficeHours().timezone
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

  // Disabled button or error message is clicked outside of office hours
  onCallNowContainerClick() {
    this.isOfficeHours$
      .pipe(take(1))
      .subscribe({
        next: (isOfficeHours) => {
          if (!isOfficeHours) {
            this.officeHoursPopoverOpen = true
          }
        }
    })
  }
}
