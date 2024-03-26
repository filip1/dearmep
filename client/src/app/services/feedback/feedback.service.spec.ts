import { TestBed } from '@angular/core/testing';

import { FeedbackService } from './feedback.service';
import { FixturesModule } from 'src/app/testing/fixtures.module';

describe('FeedbackService', () => {
  let service: FeedbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FixturesModule],
    });
    service = TestBed.inject(FeedbackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
