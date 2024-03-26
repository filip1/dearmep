import { TestBed } from '@angular/core/testing';
import { OfficeHoursService } from './office-hours.service';
import { getTranslocoModule } from 'src/app/testing/transloco-testing.module';
import { FixturesModule } from 'src/app/testing/fixtures.module';

describe('OfficeHoursService', () => {
  let service: OfficeHoursService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule(), FixturesModule],
    });
    service = TestBed.inject(OfficeHoursService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
