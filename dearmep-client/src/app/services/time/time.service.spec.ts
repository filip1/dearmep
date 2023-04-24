import { getTimezoneOffset } from 'date-fns-tz';

import { TimeService } from './time.service';

describe('TimeService', () => {
  let service: TimeService;

  beforeEach(() => {
    service = new TimeService()
  });

  it('should return current timezone', () => {
    const tz = service.getCurrentTimeZone()
    const tzOffset = getTimezoneOffset(tz)
    const now = new Date()
    expect(tzOffset).toBe(now.getTimezoneOffset() * 60 * 1000 * -1)
  });
});
