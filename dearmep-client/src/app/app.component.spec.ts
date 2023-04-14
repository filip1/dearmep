import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { TestingModule } from './testing/testing.module';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppModule,
        TestingModule,
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges()
  });

  it('should display title', () => {
    const title = fixture.debugElement.query(By.css("h1.dmep-title"))
    expect(title).toBeTruthy()
  })
  
  it('should display mep', () => {
    const mepName = fixture.debugElement.query(By.css("h3.mep-name"))
    expect(mepName).toBeTruthy() 
  })

  it('should display calling section', () => {
    const callingTitle = fixture.debugElement.query(By.css("router-outlet[name=calling-router]"))
    expect(callingTitle).toBeTruthy()
  })
});
