import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeStepComponent } from './home-step.component';
import { FixturesModule } from 'src/app/testing/fixtures.module';

describe('HomeStepComponent', () => {
  let component: HomeStepComponent;
  let fixture: ComponentFixture<HomeStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeStepComponent, FixturesModule],
    }).compileComponents();
    fixture = TestBed.createComponent(HomeStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
