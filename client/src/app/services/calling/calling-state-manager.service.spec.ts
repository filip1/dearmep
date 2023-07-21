import { TestBed } from '@angular/core/testing';

import { CallingStateManagerService } from '../calling/calling-state-manager.service';

describe('CallingStateManagerService', () => {
  let service: CallingStateManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CallingStateManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
