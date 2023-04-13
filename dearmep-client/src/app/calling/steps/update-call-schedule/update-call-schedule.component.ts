import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { StringUtil } from 'src/app/common/util/string.util';
import { Country } from 'src/app/model/country.model';
import { DayOfWeek } from 'src/app/model/day-of-week.enum';

@Component({
  selector: 'dmep-update-call-schedule',
  templateUrl: './update-call-schedule.component.html',
  styleUrls: ['./update-call-schedule.component.scss']
})
export class UpdateCallScheduleComponent implements OnInit {
  private readonly startHour = 9
  private readonly endHour = 16

  public localTimeZone?: string

  public availableTimes: string[]

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
  ) {
    this.availableTimes = []
    for (let hour = this.startHour; hour < this.endHour; hour++) {
      for (let min = 0; min < 60; min += 15) {
        this.availableTimes.push(this.formatTime(hour, min))
      }
    }
    this.availableTimes.push(this.formatTime(this.endHour, 0))
  }

  public ngOnInit(): void {
    const format = new Intl.DateTimeFormat()
    const options = format.resolvedOptions()
    this.localTimeZone = options.timeZone
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

  private formatTime(hour: number, min: number) {
    const hourStr = hour.toString().padStart(2, '0')
    const minStr = min.toString().padStart(2, '0') 
    return `${hourStr}:${minStr}`
  }

  private getNameOfDay(day: DayOfWeek): string {
    const days = this.translocoService.translateObject<string[]>("schedule.days")
    if (days && days.length > day) {
      return days[day]
    }
    return ""
  } 
}
