import { parse, set } from 'date-fns';
import { DayOfWeek } from 'src/app/model/day-of-week.enum';
import { TimeOfDay } from 'src/app/model/time-of-day';

export class TimeUtil {
  public static readonly WeekDays = [
    DayOfWeek.Monday,
    DayOfWeek.Tuesday,
    DayOfWeek.Wednesday,
    DayOfWeek.Thursday,
    DayOfWeek.Friday,
    DayOfWeek.Saturday,
    DayOfWeek.Sunday,
  ];

  public static ParseTimeOfDay(time: string): TimeOfDay {
    const t = parse(time, 'HH:mm:ss', new Date());
    return this.ToTimeOfDay(t);
  }

  public static StringifyTimeOfDay(time: TimeOfDay): string {
    const hour = time.hour.toString().padStart(2, '0');
    const min = time.min.toString().padStart(2, '0');
    const sec = time.sec.toString().padStart(2, '0');
    return `${hour}:${min}:${sec}`;
  }

  public static ToTimeOfDay(time: Date): TimeOfDay {
    return {
      hour: time.getHours(),
      min: time.getMinutes(),
      sec: time.getSeconds(),
    };
  }

  public static TimeOfDayToTimestamp(time: TimeOfDay, base: Date): Date {
    return set(base, {
      hours: time.hour,
      minutes: time.min,
      seconds: 0,
      milliseconds: 0,
    });
  }

  public static TimeOfDayEquals(a: TimeOfDay, b: TimeOfDay): boolean {
    return a.hour === b.hour && a.min === b.min && a.sec === b.sec;
  }

  public static TimeOfDayIsBefore(a: TimeOfDay, b: TimeOfDay): boolean {
    if (a.hour < b.hour) {
      return true;
    } else if (a.hour === b.hour) {
      if (a.min < b.min) {
        return true;
      } else if (a.min === b.min) {
        if (a.sec < b.sec) {
          return true;
        }
      }
    }
    return false;
  }
}
