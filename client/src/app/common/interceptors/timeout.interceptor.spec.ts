// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { TestBed } from '@angular/core/testing';

import { TimeoutInterceptor } from './timeout.interceptor';

describe('TimeoutInterceptor', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [TimeoutInterceptor],
    })
  );

  it('should be created', () => {
    const interceptor: TimeoutInterceptor = TestBed.inject(TimeoutInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
