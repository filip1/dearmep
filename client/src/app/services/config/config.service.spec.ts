import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';
import { FixturesModule } from 'src/app/testing/fixtures.module';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FixturesModule],
    });
    service = TestBed.inject(ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
