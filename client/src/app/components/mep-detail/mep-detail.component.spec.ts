import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppCommonModule } from 'src/app/common/app-common.module';

import { MEPDetailComponent } from './mep-detail.component';

describe('MEPDetailComponent', () => {
  let component: MEPDetailComponent;
  let fixture: ComponentFixture<MEPDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ AppCommonModule ],
      declarations: [ MEPDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MEPDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
