import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '../testing/transloco-testing.module';
import { CallingComponent } from './calling.component';
import { FixturesModule } from '../testing/fixtures.module';

describe('CallingComponent', () => {
  let component: CallingComponent;
  let fixture: ComponentFixture<CallingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallingComponent, getTranslocoModule(), FixturesModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CallingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
