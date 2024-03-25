import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerifyNumberComponent } from './verify-number.component';
import { FixturesModule } from 'src/app/testing/fixtures.module';

describe('VerifyNumerComponent', () => {
  let component: VerifyNumberComponent;
  let fixture: ComponentFixture<VerifyNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyNumberComponent, FixturesModule],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
