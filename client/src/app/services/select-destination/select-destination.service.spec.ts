import { TestBed } from '@angular/core/testing';

import { SelectDestinationService } from './select-destination.service';

describe('SelectDestinationService', () => {
  let service: SelectDestinationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectDestinationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
