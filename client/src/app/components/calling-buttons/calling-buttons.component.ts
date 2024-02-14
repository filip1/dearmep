import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'dmep-calling-buttons',
  templateUrl: './calling-buttons.component.html',
  styleUrls: ['./calling-buttons.component.scss']
})
export class CallingButtonsComponent {
  @Input()
  public disableScheduling = false

  @Input()
  public isOfficeHours = true

  @Input()
  public officeHoursTimezone = ''

  @Input()
  public officeHoursText: string[] = []

  @Input()
  public disabled = false

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
    }
  }

  public onCallNowContainerClick() {
    if (!this.isOfficeHours) {
      this.officeHoursPopoverOpen = true
    }
  }
}
