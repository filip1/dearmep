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
});
