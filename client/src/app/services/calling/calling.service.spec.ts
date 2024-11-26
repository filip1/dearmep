// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { TestBed } from '@angular/core/testing';

import { CallingService } from './calling.service';
import { FixturesModule } from 'src/app/testing/fixtures.module';

describe('CallingService', () => {
  let service: CallingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FixturesModule],
    });
    service = TestBed.inject(CallingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
