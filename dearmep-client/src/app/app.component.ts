import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUrlService } from './common/services/base-url.service';

@Component({
  selector: 'dmep-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class AppComponent implements OnInit, OnChanges {
  public styleUrl$?: Observable<string>
  public flagsStyleUrl$?: Observable<string>

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
  ) {}

  public ngOnInit() {
    this.styleUrl$ = this.baseUrlService.toAbsoluteUrl$("static/styles.css")
    this.flagsStyleUrl$ = this.baseUrlService.toAbsoluteUrl$("static/flags.css")
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["baseUrl"] && this.baseUrl) {
      this.baseUrlService.setBaseUrl(this.baseUrl)
    }
  }
}
