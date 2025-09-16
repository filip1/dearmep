// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Injectable, inject } from '@angular/core';
import { getTimezoneOffset, utcToZonedTime } from 'date-fns-tz';
import {
  Observable,
  combineLatest,
  distinctUntilChanged,
  map,
  mergeMap,
  shareReplay,
  timer,
} from 'rxjs';
import { DayOfWeek } from 'src/app/model/day-of-week.enum';
import { TimeService } from '../time/time.service';
import { TranslocoService } from '@ngneat/transloco';
import { environment } from 'src/environments/environment';
import { ConfigService } from '../config/config.service';
import { AppConfig } from '../config/app-config.model';
import { OfficeHoursResponse } from 'src/app/api/models';
import { TimeUtil } from 'src/app/common/util/time.util';

@Injectable({
  providedIn: 'root',
})
export class OfficeHoursService {
  private readonly timeService = inject(TimeService);
  private readonly translocoService = inject(TranslocoService);
  private readonly configService = inject(ConfigService);

  private officeHours: OfficeHoursResponse;

  private readonly isOfficeHours$;

  constructor() {
    this.officeHours = this.configService.getConfig().office_hours;

    // check every second if we are in office hours
    this.isOfficeHours$ = timer(0, 1000).pipe(
      map(() => this.isInOfficeHours(this.timeService.now())),
      distinctUntilChanged(),
      shareReplay()
    );

    this.configService.getConfig$().subscribe({
      next: (config: AppConfig) => {
        this.officeHours = config.office_hours;
      },
    });
  }

  public getOfficeHours(): OfficeHoursResponse {
    return this.officeHours;
  }

  public inOfficeHours$(): Observable<boolean> {
    return this.isOfficeHours$;
  }

  public getOfficeHoursText$(): Observable<string[]> {
    const dailyOfficeHours = TimeUtil.WeekDays.filter(
      day => this.officeHours.weekdays[day]
    ).map(day => {
      const intervals = this.officeHours.weekdays[day];

      const timeRanges = combineLatest(
        intervals.map(interval =>
          this.translocoService.selectTranslate(
            'call.office-hours.time-range',
            {
              startTime: interval.begin.endsWith(':00')
                ? interval.begin.substring(0, interval.begin.length - 3)
                : interval.begin,
              endTime: interval.end.endsWith(':00')
                ? interval.end.substring(0, interval.end.length - 3)
                : interval.end,
            }
          )
        )
      ).pipe(map(ranges => ranges.join(' ')));

      return combineLatest([
        this.translocoService.selectTranslateObject(
          'schedule.days'
        ) as Observable<string[]>,
        timeRanges,
      ]).pipe(
        mergeMap(([days, timeRange]) =>
          this.translocoService.selectTranslate(
            'call.office-hours.hours-zoned',
            { dayOrRange: days[day], timeRange }
          )
        )
      );
    });

    return combineLatest(dailyOfficeHours);
  }

  public isInOfficeHours(time: Date): boolean {
    if (environment.disableOfficeHoursCheck) {
      return true;
    }

    const day = this.getDayOfWeek(time, this.officeHours.timezone);
    const dailyHours = this.officeHours.weekdays[day];
    if (!dailyHours) {
      return false;
    }

    const destinationTime = utcToZonedTime(time, this.officeHours.timezone);
    const destTimeOfDay = TimeUtil.ToTimeOfDay(destinationTime);

    for (const interval of dailyHours) {
      const startTime = TimeUtil.ParseTimeOfDay(interval.begin);
      const endTime = TimeUtil.ParseTimeOfDay(interval.end);
      if (
        !TimeUtil.TimeOfDayIsBefore(destTimeOfDay, startTime) &&
        TimeUtil.TimeOfDayIsBefore(destTimeOfDay, endTime)
      ) {
        return true;
      }
    }
    return false;
  }

  public getDays() {
    return TimeUtil.WeekDays.filter(day => this.officeHours.weekdays[day]);
  }

  /**
   * Returns true if there is no difference in time between the browser time and the destination time
   */
  public isLocalTimezone(timezone: string) {
    const localTimeZone = this.timeService.getLocalTimeZone();
    return (
      getTimezoneOffset(timezone, new Date()) ===
      getTimezoneOffset(localTimeZone, new Date())
    );
  }

  /**
   * Day of week in destination timezone
   * @param time Local time
   * @param timezone Destination timezone
   */
  private getDayOfWeek(time: Date, timezone: string): DayOfWeek {
    const day = utcToZonedTime(time, timezone).getDay();
    if (day === 0) {
      return DayOfWeek.Sunday;
    }
    return day as DayOfWeek;
  }
}
