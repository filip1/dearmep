import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppCommonModule } from 'src/app/common/app-common.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { TestingModule } from 'src/app/testing/testing.module';
import { UpdateCallScheduleComponent } from './update-call-schedule.component';


describe('UpdateCallScheduleComponent', () => {
  let component: UpdateCallScheduleComponent;
  let fixture: ComponentFixture<UpdateCallScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        AppCommonModule,
        TestingModule,
        ComponentsModule,
      ],
      declarations: [ UpdateCallScheduleComponent ]
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
