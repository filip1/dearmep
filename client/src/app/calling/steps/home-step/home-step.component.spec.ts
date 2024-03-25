import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeStepComponent } from './home-step.component';

describe('HomeStepComponent', () => {
  let component: HomeStepComponent;
  let fixture: ComponentFixture<HomeStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [HomeStepComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(HomeStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
