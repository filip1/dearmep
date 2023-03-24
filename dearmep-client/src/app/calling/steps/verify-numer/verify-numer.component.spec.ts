import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyNumerComponent } from './verify-numer.component';

describe('VerifyNumerComponent', () => {
  let component: VerifyNumerComponent;
  let fixture: ComponentFixture<VerifyNumerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyNumerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyNumerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
