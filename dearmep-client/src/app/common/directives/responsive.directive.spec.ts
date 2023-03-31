import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResponsiveDirective } from './responsive.directive';
import { delay } from '../util/delay';

const widthPx = 250
const breakpointPx = 200
const className = "test-class"

describe('ResponsiveDirective', () => {
  @Component({
    selector: 'dmep-test-component',
    template: '<div id="testDiv" dmepResponsive [breakpointPx]="breakpointPx" [responsiveClassName]="className" [style.width.px]="widthPx" (breakpointReached)="breakpointReached = $event"></div>',
  })
  class TestComponent {
    public widthPx = widthPx
    public breakpointPx = breakpointPx
    public className = className
    public breakpointReached?: boolean
  }

  let testComponent: TestComponent
  let fixture: ComponentFixture<TestComponent>
  let fixtureEl: HTMLElement
  let testDiv: Element | null | undefined

  beforeEach(async () => {    
    await TestBed.configureTestingModule({ 
      declarations: [
        ResponsiveDirective,
        TestComponent,
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance
    fixtureEl = fixture.nativeElement
    testDiv = fixtureEl.querySelector("#testDiv")
  })
 
  it('should detect size above breakpoint', async () => {
    fixture.detectChanges()
    await fixture.whenStable()
    await fixture.whenRenderingDone()
    await delay(10)
    expect(testDiv?.clientWidth).toBe(widthPx)
    expect(testDiv?.classList.contains(className)).toBeFalse() 
    expect(testComponent.breakpointReached).toBeFalse() 
  });

  it('should detect size below breakpoint', async () => {
    testComponent.widthPx = 150
    fixture.detectChanges()
    await fixture.whenStable()
    await fixture.whenRenderingDone()
    await delay(10)
    expect(testDiv?.clientWidth).toBe(150)
    expect(testDiv?.classList.contains(className)).toBeTrue() 
    expect(testComponent.breakpointReached).toBeTrue()
  })
});
