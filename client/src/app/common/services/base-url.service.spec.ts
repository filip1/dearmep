// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { TestBed } from '@angular/core/testing';

import { BaseUrlService } from './base-url.service';

describe('BaseUrlService', () => {
  let service: BaseUrlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BaseUrlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
