import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCallScheduleComponent } from './update-call-schedule.component';
import { FixturesModule } from 'src/app/testing/fixtures.module';

describe('UpdateCallScheduleComponent', () => {
  let component: UpdateCallScheduleComponent;
  let fixture: ComponentFixture<UpdateCallScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateCallScheduleComponent, FixturesModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateCallScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
