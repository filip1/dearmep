import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectMEPComponent } from './select-mep.component';
import { getTranslocoModule } from 'src/app/testing/transloco-testing.module';
import { FixturesModule } from 'src/app/testing/fixtures.module';

describe('SelectMEPComponent', () => {
  let component: SelectMEPComponent;
  let fixture: ComponentFixture<SelectMEPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [getTranslocoModule(), FixturesModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectMEPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
