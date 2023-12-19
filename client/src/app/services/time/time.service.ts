import { Injectable } from '@angular/core';

/***
 * This service helps to isolate side-effects that are related to current system-time and system-time-zone
 */
@Injectable({
  providedIn: 'root'
})
export class TimeService {
  public getLocalTimeZone(): string {
    const format = new Intl.DateTimeFormat()
    const options = format.resolvedOptions()
    return options.timeZone
  }

  public now(): Date {
    return new Date()
  }
}
