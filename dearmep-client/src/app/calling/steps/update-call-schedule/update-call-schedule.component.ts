import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { addMinutes, format, isBefore, isEqual, set, setHours } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { StringUtil } from 'src/app/common/util/string.util';
import { Country } from 'src/app/model/country.model';
import { DayOfWeek } from 'src/app/model/day-of-week.enum';
import { TimeService } from 'src/app/services/time.service';

@Component({
  selector: 'dmep-update-call-schedule',
  templateUrl: './update-call-schedule.component.html',
  styleUrls: ['./update-call-schedule.component.scss']
})
export class UpdateCallScheduleComponent implements OnInit {
  private readonly startHour = 9
  private readonly endHour = 18
  private readonly targetTimeZone = "Europe/Brussels"

  public localTimeZone?: string

  public availableTimes?: string[]

  public selectedCountry: Country | null = null

  public availableDays = [
    DayOfWeek.Monday,
    DayOfWeek.Tuesday,
    DayOfWeek.Wednesday,
    DayOfWeek.Thursday,
    DayOfWeek.Friday,
  ]

  public selectedDayFormControl = new FormControl<DayOfWeek>(DayOfWeek.Monday)
  public selectedTimeFormControls = new Map(
    this.availableDays.map((day) => [ day, new FormControl<string | null>(null) ])
  )

  constructor(
    private readonly translocoService: TranslocoService,
    private readonly timeSerivce: TimeService,
  ) { }

  public ngOnInit(): void {
    this.localTimeZone = this.timeSerivce.getCurrentTimeZone()
    this.availableTimes = this.getAvailableTimes()
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
    const countryStrBold = `<b>${ this.selectedCountry?.name }</b>`

    return this.translocoService.translate("schedule.scheduleAsText", { timeSlots: timeSlotsString, country: countryStrBold })
  }

  public removeSelectedTime() {
    const control = this.getSelectTimeFormControl()
    control.reset(null)
  }

  private getNameOfDay(day: DayOfWeek): string {
    const days = this.translocoService.translateObject<string[]>("schedule.days")
    if (days && days.length > day) {
      return days[day]
    }
    return ""
  } 

  private getTimestampFromHour(hour: number, timezone: string) {
    const timeTarget = set(new Date(), { hours: hour, minutes: 0, seconds: 0, milliseconds: 0 })
    return zonedTimeToUtc(timeTarget, timezone)
  }

  private getAvailableTimes(): string[] {
    const result: string[] = []

    const startTime = this.getTimestampFromHour(this.startHour, this.targetTimeZone)
    const endTime = this.getTimestampFromHour(this.endHour, this.targetTimeZone)

    for (let time = startTime; isBefore(time, endTime) || isEqual(time, endTime); time = addMinutes(time, 15)) {
      result.push(format(time, "HH:mm"))
    }
    return result
  }
}
