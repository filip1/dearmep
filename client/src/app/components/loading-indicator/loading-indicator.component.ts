import { Component } from '@angular/core';
import { LoadingService } from 'src/app/common/services/loading.service';

@Component({
  selector: 'dmep-loading-indicator',
  templateUrl: './loading-indicator.component.html',
  styleUrls: ['./loading-indicator.component.css']
})
export class LoadingIndicatorComponent {
  public isLoading$;

  constructor(loadingService: LoadingService) {
    this.isLoading$ = loadingService.getLoading$()
  }

}
