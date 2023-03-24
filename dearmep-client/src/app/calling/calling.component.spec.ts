import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallingComponent } from './calling.component';
import { CallingModule } from './calling.module';

describe('CallingComponent', () => {
  let component: CallingComponent;
  let fixture: ComponentFixture<CallingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CallingModule ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
