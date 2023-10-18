import { Injectable } from '@angular/core';
import { format, set } from 'date-fns';
import { getTimezoneOffset, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { Observable, combineLatest, distinctUntilChanged, filter, map, mergeMap, shareReplay, timer } from 'rxjs';
import { DayOfWeek } from 'src/app/model/day-of-week.enum';
import { TimeOfDay } from 'src/app/model/time-of-day';
import { TimeService } from '../time/time.service';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({
  providedIn: 'root'
})
export class OfficeHoursService {
  // To simplify things a bit this service currently assumes
  // the same hours each day of the week.
  private readonly timezone = "Europe/Brussels"
  private readonly days = [
    DayOfWeek.Monday,
    DayOfWeek.Tuesday,
    DayOfWeek.Wednesday,
    DayOfWeek.Thursday,
    DayOfWeek.Friday,
  ]
  private readonly startTime: TimeOfDay = { hour: 9, min: 0 }
  private readonly endTime: TimeOfDay = { hour: 18, min: 0 }
  private readonly isOfficeHours$

  constructor(
    private readonly timeService: TimeService,
    private readonly translocoService: TranslocoService,
  ) {
    // check every second if we are in office hours
    this.isOfficeHours$ = timer(0, 1000).pipe(
      map(() => this.isInOfficeHours(new Date())),
      distinctUntilChanged(),
      shareReplay(),
    )
  }

  public inOfficeHours$(): Observable<boolean> {
    return this.isOfficeHours$
  }

  public getOfficeHoursText$(): Observable<string> {
    const startDay = this.days[0]
    const endDay = this.days[this.days.length - 1]

    const startTime = format(this.toTimestamp(this.startTime), "HH:mm")
    const endTime = format(this.toTimestamp(this.endTime), "HH:mm")
    const startTimeLocal = format(this.toTimestampLocal(this.startTime, this.timezone), "HH:mm")
    const endTimeLocal = format(this.toTimestampLocal(this.endTime, this.timezone), "HH:mm")

    return combineLatest([
      this.translocoService.selectTranslateObject('schedule.days').pipe(
        filter(days => days && Array.isArray(days)),
        mergeMap((days: string[]) => this.translocoService.selectTranslate('call.office-hours.day-range', { startDayOfWeek: days[startDay], endDayOfWeek: days[endDay] }))
      ),
      this.translocoService.selectTranslate(this.isSameTimezone() ? 'call.office-hours.time-range' : 'call.office-hours.time-range-zoned', { startTime, endTime, timeZone: this.timezone }),
      this.translocoService.selectTranslate('call.office-hours.time-zone-local').pipe(
        mergeMap(local => this.translocoService.selectTranslate('call.office-hours.time-range-zoned', { startTime: startTimeLocal, endTime: endTimeLocal, timeZone: local }))
      )
    ]).pipe(
      mergeMap(([ dayOrRange, timeRange, timeRangeLocal ]) => this.translocoService.selectTranslate(this.isSameTimezone() ? 'call.office-hours.hours' : 'call.office-hours.hours-zoned',
        { dayOrRange, timeRange, timeRangeLocal }))
    )
  }

  public isInOfficeHours(time: Date): boolean {
    const day = this.getDayOfWeek(time, this.timezone)
    if (this.days.indexOf(day) === -1) {
      return false
    }

    const destinationTime = utcToZonedTime(time, this.timezone)
    const destTimeOfDay: TimeOfDay = { hour: destinationTime.getHours(), min: destinationTime.getMinutes() }

    return this.isAfter(destTimeOfDay, this.startTime) && !this.isAfter(destTimeOfDay, this.endTime)
  }

  public getTimezone() {
    return this.timezone
  }

  /**
   * Returns true if there is no difference in time between the browser time and the destination time
   */
  public isSameTimezone() {
    const localTimeZone = this.timeService.getCurrentTimeZone()
    return getTimezoneOffset(this.timezone, new Date()) === getTimezoneOffset(localTimeZone, new Date())
  }

  public getDays() {
    return this.days
  }

  public getStartTime() {
    return this.startTime
  }

  public getEndTime() {
    return this.endTime
  }

  public getStartTimestampLocal() {
    return this.toTimestampLocal(this.startTime, this.timezone)
  }

  public getEndTimestampLocal() {
    return this.toTimestampLocal(this.endTime, this.timezone)
  }

  private toTimestampLocal(time: TimeOfDay, timezone: string, base: Date = new Date()): Date {
    const timeDestination = this.toTimestamp(time, base)
    return zonedTimeToUtc(timeDestination, timezone)
  }

  private toTimestamp(time: TimeOfDay, base: Date = new Date()): Date {
    return set(base, { hours: time.hour, minutes: time.min, seconds: 0, milliseconds: 0 })
  }

  /**
   * Day of week in destination timezone
   * @param time Local time
   * @param timezone Destination timezone
   */
  private getDayOfWeek(time: Date, timezone: string): DayOfWeek {
    return utcToZonedTime(new Date(), timezone).getDay()
  }

  private isAfter(time: TimeOfDay, timeToCompare: TimeOfDay): boolean {
    return time.hour > timeToCompare.hour || (time.hour === timeToCompare.hour && time.min >= timeToCompare.min)
  }
}
