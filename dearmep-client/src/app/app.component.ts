import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUrlService } from './common/services/base-url.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class AppComponent implements OnChanges {
  public styleUrl$?: Observable<string>

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input("host")
  public baseUrl?: string

  constructor(
    private readonly baseUrlService: BaseUrlService,
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["baseUrl"] && this.baseUrl) {
      this.baseUrlService.setBaseUrl(this.baseUrl)
    }
    this.styleUrl$ = this.baseUrlService.toAbsoluteUrl$("styles.css")
  }
}
