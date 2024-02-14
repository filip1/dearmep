import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'dmep-calling-buttons',
  templateUrl: './calling-buttons.component.html',
  styleUrls: ['./calling-buttons.component.scss']
})
export class CallingButtonsComponent {
  @Input()
  public disableScheduling: boolean = false

  @Input()
  public isOfficeHours: boolean = true

  @Input()
  public officeHoursTimezone: string = ''

  @Input()
  public officeHoursText: string[] = []

  @Input()
  public disabled: boolean = false

  @Output()
  public callNowClick = new EventEmitter()

  @Output()
  public callLaterClick = new EventEmitter()

  public officeHoursPopoverOpen = false

  public onCallLaterClick() {
    if (!this.disabled) {
      this.callLaterClick.emit()
    }
  }

  public onCallNowClick() {
    if (this.isOfficeHours && !this.disabled) {
      this.callNowClick.emit()
    } else {
    }
  }

  public onCallNowContainerClick() {
    if (!this.isOfficeHours) {
      this.officeHoursPopoverOpen = true
    }
  }
}
