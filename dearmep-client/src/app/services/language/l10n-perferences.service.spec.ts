import { TestBed } from '@angular/core/testing';

import { L10nPerferencesService } from './l10n-preferences.service';
import { TestingModule } from 'src/app/testing/testing.module';
import { LocalStorageService } from '../local-storage/local-storage.service';

describe('L10nPerferencesService', () => {
  let service: L10nPerferencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ 
        TestingModule,
      ],
      providers: [
        LocalStorageService,
      ]
    });
    service = TestBed.inject(L10nPerferencesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
