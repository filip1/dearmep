import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
// Change this import to enable optimizations as soon as https://github.com/marnusw/date-fns-tz/issues/193 is fixed
import { addMinutes, format, isBefore, isEqual } from 'date-fns/esm';
import { Subject, takeUntil } from 'rxjs';
import { StringUtil } from 'src/app/common/util/string.util';
import { DayOfWeek } from 'src/app/model/day-of-week.enum';
import { L10nService } from 'src/app/services/l10n/l10n.service';
import { OfficeHoursService } from 'src/app/services/office-hours/office-hours.service';
import { RoutingStateManagerService } from 'src/app/services/routing/routing-state-manager.service';
import { TimeService } from 'src/app/services/time/time.service';

@Component({
  selector: 'dmep-update-call-schedule',
  templateUrl: './update-call-schedule.component.html',
  styleUrls: ['./update-call-schedule.component.scss']
})
export class UpdateCallScheduleComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>()

  public localTimeZone?: string

  public availableTimes?: string[]

  public selectedCountry: string | undefined

  public availableDays

  public selectedDayFormControl = new FormControl<DayOfWeek>(DayOfWeek.Monday)
  public selectedTimeFormControls

  constructor(
    private readonly translocoService: TranslocoService,
    private readonly timeSerivce: TimeService,
    private readonly l10nService: L10nService,
    private readonly routingStateManager: RoutingStateManagerService,
    private readonly officeHoursService: OfficeHoursService,
  ) {
    this.availableDays = officeHoursService.getDays()
    this.selectedTimeFormControls = new Map(
      this.availableDays.map((day) => [ day, new FormControl<string | null>(null) ])
    )
  }

  public ngOnInit(): void {
    this.localTimeZone = this.timeSerivce.getCurrentTimeZone()
    this.availableTimes = this.getAvailableTimes()

    this.l10nService.getCountry$().pipe(
      takeUntil(this.destroyed$),
    ).subscribe({
      next: (c) => this.selectedCountry = c
    })
  }

  public ngOnDestroy(): void {
    this.destroyed$.next()
    this.destroyed$.complete()
  }

  public isTimeSelectedForDay(day: DayOfWeek) {
    return !!this.selectedTimeFormControls.get(day)?.value
  }

  public getSelectTimeFormControl() {
    if (!this.selectedDayFormControl.value) {
      throw Error("no day selected")
    }
    const control = this.selectedTimeFormControls.get(this.selectedDayFormControl.value)
    if (!control) {
      throw Error("form control for day is not defined")
    }
    return control
  }

  public getSelectedTimesAsText() {
    const timeSlots: string[] = []
    for (const day of this.availableDays) {
      const control = this.selectedTimeFormControls.get(day)
      if (control?.value) {
        const nameOfDay = this.getNameOfDay(day)
        const time = control.value
        const timeSlot = this.translocoService.translate("schedule.timeSlot", { dayOfWeek: nameOfDay, time })
        const timeSlotBold = `<b>${timeSlot}</b>`
        timeSlots.push(timeSlotBold)
      }
    }

    if (timeSlots.length === 0) {
      return ""
    }

    const delimiter = this.translocoService.translate("util.join.delimiter")
    const lastDelimiter = this.translocoService.translate("util.join.lastDelimiter")
    const timeSlotsString = StringUtil.JoinAnd(timeSlots, delimiter, lastDelimiter)
    const countryName = this.translocoService.translate(`countries.${this.selectedCountry}`)
    const countryStrBold = `<b>${ countryName }</b>`

    return this.translocoService.translate("schedule.scheduleAsText", { timeSlots: timeSlotsString, country: countryStrBold })
  }

  public removeSelectedTime() {
    const control = this.getSelectTimeFormControl()
    control.reset(null)
  }

  public onScheduleClick() {
    this.routingStateManager.returnHome()
  }

  private getNameOfDay(day: DayOfWeek): string {
    const days = this.translocoService.translateObject<string[]>("schedule.days")
    if (days && days.length > day) {
      return days[day]
    }
    return ""
  }

  private getAvailableTimes(): string[] {
    const result: string[] = []

    const startTime = this.officeHoursService.getStartTimestampLocal()
    const endTime = this.officeHoursService.getEndTimestampLocal()

    for (let time = startTime; isBefore(time, endTime) || isEqual(time, endTime); time = addMinutes(time, 15)) {
      result.push(format(time, "HH:mm"))
    }
    return result
  }
}
