import { TestBed } from '@angular/core/testing';
import { SelectDestinationService } from './select-destination.service';
import { getTranslocoModule } from 'src/app/testing/transloco-testing.module';
import { FixturesModule } from 'src/app/testing/fixtures.module';

describe('SelectDestinationService', () => {
  let service: SelectDestinationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FixturesModule, getTranslocoModule()],
    });
    service = TestBed.inject(SelectDestinationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
