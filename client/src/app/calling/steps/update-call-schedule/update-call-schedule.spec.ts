import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppCommonModule } from 'src/app/common/app-common.module';
import { ComponentsModule } from 'src/app/components/components.module';

import { UpdateCallScheduleComponent } from './update-call-schedule.component';


describe('UpdateCallScheduleComponent', () => {
  let component: UpdateCallScheduleComponent;
  let fixture: ComponentFixture<UpdateCallScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
    AppCommonModule,
    ComponentsModule,
    UpdateCallScheduleComponent,
]
})
    .compileComponents();

    fixture = TestBed.createComponent(UpdateCallScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
