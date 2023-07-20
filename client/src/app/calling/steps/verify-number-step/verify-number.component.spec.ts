import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppCommonModule } from 'src/app/common/app-common.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { TestingModule } from 'src/app/testing/testing.module';

import { VerifyNumberComponent } from './verify-number.component';

describe('VerifyNumerComponent', () => {
  let component: VerifyNumberComponent;
  let fixture: ComponentFixture<VerifyNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        AppCommonModule,
        ComponentsModule,
        TestingModule
      ],
      declarations: [ VerifyNumberComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
