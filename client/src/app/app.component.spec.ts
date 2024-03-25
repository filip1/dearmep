import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';

import { getTranslocoModule } from './testing/transloco-testing.module';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
    AppModule,
    getTranslocoModule(),
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
    const callingTitle = fixture.debugElement.query(By.css("h2.calling-title"))
    expect(callingTitle).toBeTruthy()
  })

  it('should display footer section', () => {
    const footer = fixture.debugElement.query(By.css(".dmep-footer"))
    expect(footer).toBeTruthy()
  })
});
