import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentsModule } from '../components.module';

import { SelectMEPComponent } from './select-mep.component';

describe('SelectMEPComponent', () => {
  let component: SelectMEPComponent;
  let fixture: ComponentFixture<SelectMEPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
    ComponentsModule,
],

    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectMEPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
