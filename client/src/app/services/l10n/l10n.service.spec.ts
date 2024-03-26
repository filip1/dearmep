import { TestBed } from '@angular/core/testing';

import { L10nService } from './l10n.service';

import { LocalStorageService } from '../local-storage/local-storage.service';
import { getTranslocoModule } from 'src/app/testing/transloco-testing.module';
import { FixturesModule } from 'src/app/testing/fixtures.module';

describe('L10nService', () => {
  let service: L10nService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FixturesModule, getTranslocoModule()],
      providers: [LocalStorageService],
    });
    service = TestBed.inject(L10nService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
