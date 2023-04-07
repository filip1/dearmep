import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppCommonModule } from 'src/app/common/app-common.module';
import { TestingModule } from 'src/app/testing/testing.module';

import { VerifyNumerComponent } from './verify-numer.component';

describe('VerifyNumerComponent', () => {
  let component: VerifyNumerComponent;
  let fixture: ComponentFixture<VerifyNumerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        AppCommonModule,
        TestingModule
      ],
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
