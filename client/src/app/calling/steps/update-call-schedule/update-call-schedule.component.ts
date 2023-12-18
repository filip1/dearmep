import { HttpContext } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { zonedTimeToUtc } from 'date-fns-tz';
// Change this import to enable optimizations as soon as https://github.com/marnusw/date-fns-tz/issues/193 is fixed
import { addMinutes, isBefore } from 'date-fns/esm';
import { Subject, take, takeUntil } from 'rxjs';
import { OfficeHoursInterval, OfficeHoursResponse, Schedule } from 'src/app/api/models';
import { ApiService } from 'src/app/api/services';
import { AUTH_TOKEN_REQUIRED } from 'src/app/common/interceptors/auth.interceptor';
import { StringUtil } from 'src/app/common/util/string.util';
import { TimeUtil } from 'src/app/common/util/time.util';
import { DayOfWeek } from 'src/app/model/day-of-week.enum';
import { TimeOfDay } from 'src/app/model/time-of-day';
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

  public scheduleLoaded = false

  public localTimeZone?: string

  public availableTimes?: Map<DayOfWeek, TimeOfDay[]>

  public selectedCountry: string | undefined

  public availableDays

  public selectedDayFormControl = new FormControl<DayOfWeek>(DayOfWeek.Monday)
  public selectedTimeFormControls

  private officeHours: OfficeHoursResponse

  private language?: string

  constructor(
    private readonly translocoService: TranslocoService,
    private readonly timeService: TimeService,
    private readonly l10nService: L10nService,
    private readonly routingStateManager: RoutingStateManagerService,
    private readonly officeHoursService: OfficeHoursService,
    private readonly apiService: ApiService,
  ) {
    this.officeHours = officeHoursService.getOfficeHours()
    this.availableDays = officeHoursService.getDays()

    this.selectedTimeFormControls = new Map(
      this.availableDays.map((day) => [ day, new FormControl<TimeOfDay | null>({ value: null, disabled: true }) ])
    )
  }

  public ngOnInit(): void {
    this.localTimeZone = this.timeService.getLocalTimeZone()
    this.availableTimes = this.getTimesForDays()

    this.l10nService.getCountry$().pipe(
      takeUntil(this.destroyed$),
    ).subscribe({
      next: (c) => this.selectedCountry = c
    })

    this.apiService.getSchedule({}, new HttpContext().set(AUTH_TOKEN_REQUIRED, true)).pipe(
      take(1)
    ).subscribe({
      next: (schedule) => {
        for (const s of schedule.schedule) {
          const d: DayOfWeek = s.day
          const t = TimeUtil.ParseTimeOfDay(s.start_time)
          const control = this.selectedTimeFormControls.get(d)
          if (control) {
            control.setValue(t)
          }
        }
        for (const ctrl of this.selectedTimeFormControls.values()) {
          ctrl.enable()
        }
      }
    })

    this.l10nService.getLanguage$().pipe(
      takeUntil(this.destroyed$),
    ).subscribe({
      next: (l) => this.language = l
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

  public getTimes() {
    const day = this.selectedDayFormControl.value
    if (!day) {
      throw Error("no day selected")
    }
    return this.availableTimes?.get(day)
  }

  public getSelectedTimesAsText() {
    const timeSlots: string[] = []
    for (const day of this.availableDays) {
      const control = this.selectedTimeFormControls.get(day)
      if (control?.value) {
        const nameOfDay = this.getNameOfDay(day)
        const time = this.formatTimeOfDay(control.value)
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
    const schedule: Schedule[] = []
    for (const day of this.availableDays) {
      const control = this.selectedTimeFormControls.get(day)
      const time = control?.value
      if (time) {
        schedule.push({
          day,
          start_time: TimeUtil.StringifyTimeOfDay(time)
        })
      }
    }

    this.apiService.setSchedule({
      body: {
        language: this.language as string,
        schedule,
      },
    }, new HttpContext().set(AUTH_TOKEN_REQUIRED, true)).pipe(
      take(1)
    ).subscribe({
      next: () => {
        this.routingStateManager.returnHome()
      }
    })
  }

  public formatTimeOfDay(t: TimeOfDay): string {
    const hour = t.hour.toString().padStart(2, "0")
    const min = t.min.toString().padStart(2, "0")
    return `${hour}:${min}`
  }

  public compareTimes(a: TimeOfDay, b: TimeOfDay): boolean {
    if (!a || !b) {
      return false
    }
    return TimeUtil.TimeOfDayEquals(a, b)
  }

  private getNameOfDay(day: DayOfWeek): string {
    const days = this.translocoService.translateObject<string[]>("schedule.days")
    if (days && days.length > day) {
      return days[day]
    }
    return ""
  }

  private getTimesForDays(): Map<DayOfWeek, TimeOfDay[]> {
    const officeHours = this.officeHoursService.getOfficeHours()
    return new Map(this.availableDays.map(d => [
      d,
      officeHours.weekdays[d].flatMap(interval => this.getAvailableTimes(interval)),
    ]))
  }

  private getAvailableTimes(interval: OfficeHoursInterval): TimeOfDay[] {
    const result: TimeOfDay[] = []

    const timezone = this.officeHours.timezone
    let startTime = TimeUtil.TimeOfDayToTimestamp(TimeUtil.ParseTimeOfDay(interval.begin), new Date())
    let endTime = TimeUtil.TimeOfDayToTimestamp(TimeUtil.ParseTimeOfDay(interval.end), new Date())
    startTime = zonedTimeToUtc(startTime, timezone)
    endTime = zonedTimeToUtc(endTime, timezone)

    for (let time = startTime; isBefore(time, endTime); time = addMinutes(time, this.officeHours.call_schedule_interval)) {
      result.push(TimeUtil.ToTimeOfDay(time))
    }
    return result
  }
}
