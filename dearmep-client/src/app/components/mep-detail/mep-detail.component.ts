import { Component, Input, Output } from '@angular/core';

@Component({
  selector: 'dmep-mep-detail',
  templateUrl: './mep-detail.component.html',
  styleUrls: ['./mep-detail.component.scss']
})
export class MEPDetailComponent {
  @Input()
  public allowChangeMEP?: boolean | null
}
