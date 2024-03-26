import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TalkingPointsComponent } from './talking-points.component';

describe('TalkingPointsComponent', () => {
  let component: TalkingPointsComponent;
  let fixture: ComponentFixture<TalkingPointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TalkingPointsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TalkingPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
