// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { TestBed } from '@angular/core/testing';

import { RetryInterceptor } from './retry.interceptor';

describe('RetryInterceptor', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [RetryInterceptor],
    })
  );

  it('should be created', () => {
    const interceptor: RetryInterceptor = TestBed.inject(RetryInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
