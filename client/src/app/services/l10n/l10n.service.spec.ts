import { TestBed } from '@angular/core/testing';

import { L10nService } from './l10n.service';

import { LocalStorageService } from '../local-storage/local-storage.service';

describe('L10nService', () => {
  let service: L10nService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        LocalStorageService,
      ]
    });
    service = TestBed.inject(L10nService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
