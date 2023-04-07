import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BaseUrlService } from './common/services/base-url.service';
import { CallingStep } from './model/calling-step.enum';
import { CallingStateManagerService } from './services/calling/calling-state-manager.service';

@Component({
  selector: 'dmep-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class AppComponent implements OnInit, OnChanges {
  public styleUrl$?: Observable<string>
  public flagsStyleUrl$?: Observable<string>
  public shouldDisplayTalkingPoints$?: Observable<boolean>
  public shouldDisplayTitle$?: Observable<boolean>
  public shouldDisplayMEP$?: Observable<boolean>

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input("host")
  public baseUrl?: string

  @Input()
  public language?: string

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input("disable-calling")
  public disableCalling = false

  constructor(
    private readonly baseUrlService: BaseUrlService,
    private readonly callingStateManagerService: CallingStateManagerService,
  ) {}

  public ngOnInit() {
    this.styleUrl$ = this.baseUrlService.toAbsoluteUrl$("static/styles.css")
    this.flagsStyleUrl$ = this.baseUrlService.toAbsoluteUrl$("static/flags.css")
    this.shouldDisplayTalkingPoints$ = this.callingStateManagerService.getStep$().pipe(
      map(step => step !== CallingStep.Home && step !== CallingStep.HomeAuthenticated)
    );
    this.shouldDisplayTitle$ = this.callingStateManagerService.getStep$().pipe(
      map(step => step === CallingStep.Home || step === CallingStep.HomeAuthenticated || step == CallingStep.UpdateCallSchedule)
    );
    this.shouldDisplayMEP$ = this.callingStateManagerService.getStep$().pipe(
      map(step => step !== CallingStep.UpdateCallSchedule)
    )
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["baseUrl"] && this.baseUrl) {
      this.baseUrlService.setBaseUrl(this.baseUrl)
    }
  }
}
