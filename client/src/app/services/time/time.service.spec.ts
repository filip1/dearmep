// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { getTimezoneOffset } from 'date-fns-tz';

import { TimeService } from './time.service';

describe('TimeService', () => {
  let service: TimeService;

  beforeEach(() => {
    service = new TimeService();
  });

  it('should return current timezone', () => {
    const tz = service.getLocalTimeZone();
    const tzOffset = getTimezoneOffset(tz);
    const now = new Date();
    expect(tzOffset).toBe(now.getTimezoneOffset() * 60 * 1000 * -1);
  });
});
