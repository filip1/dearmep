import { format } from 'date-fns';
import { formatInTimeZone, getTimezoneOffset } from 'date-fns-tz';

import { TimeService } from './time.service';

describe('TimeService', () => {
  let service: TimeService;

  beforeEach(() => {
    service = new TimeService()
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should return current timezone', () => {
    const tz = service.getCurrentTimeZone()
    const tzOffset = getTimezoneOffset(tz)
    const now = new Date()
    expect(tzOffset).toBe(now.getTimezoneOffset() * 60 * 1000 * -1)
  });
});
