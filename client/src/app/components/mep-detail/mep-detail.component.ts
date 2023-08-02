import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DestinationRead } from 'src/app/api/models';

@Component({
  selector: 'dmep-mep-detail',
  templateUrl: './mep-detail.component.html',
  styleUrls: ['./mep-detail.component.scss']
})
export class MEPDetailComponent {
  public imageLoadedUrl?: string

  @Input()
  public allowChangeMEP?: boolean | null

  @Input()
  public mep?: DestinationRead | null

  @Output()
  public MEPChange = new EventEmitter<void>()

  public MEPChangeClick() {
    this.MEPChange.emit()
  }

  public imageLoaded(): boolean {
    return !!this.mep?.portrait && this.mep.portrait === this.imageLoadedUrl
  }
}
