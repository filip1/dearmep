import { ChangeDetectorRef, Directive, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';

/**
 * Watches width of dom-element that this decorator is applied to.
 * Applies class to the element if the width drops below the given brakpoint.
 * Can be used as alternative to media queries in cases where using a media-query
 * would not make much sense. This might be because with media-queries it is only
 * possible to apply styles depinding on the dimensions of the viewport not depending
 * on actual component size.
 */
@Directive({
  selector: '[dmepResponsive]'
})
export class ResponsiveDirective implements OnInit {
  private resizeObserver?: ResizeObserver;
  private breakpointReachedState?: boolean

  @Input()
  public breakpointPx = -1

  @Input()
  public responsiveClassName = "responsive"

  @Output()
  public breakpointReached = new EventEmitter<boolean>()

  constructor(private readonly elementRef: ElementRef, private readonly changeDetectorRef: ChangeDetectorRef) { }

  public ngOnInit(): void {
    this.resizeObserver = new ResizeObserver((entries) => this.onResize(entries))
    if (this.elementRef.nativeElement) {
      this.resizeObserver.observe(this.elementRef.nativeElement)
    }
  }

  private onResize(entries: ResizeObserverEntry[]): void {
    if (entries.length < 1 || entries[0].borderBoxSize.length < 1) {
      return
    }

    const width = entries[0].borderBoxSize[0].inlineSize
    const bpReached = width < this.breakpointPx;

    if (bpReached !== this.breakpointReachedState) {
      this.breakpointReachedState = bpReached
      this.breakpointReached.emit(bpReached)
      this.applyClass(bpReached);
      // It is necessary to trigger change detection cycle manually
      // as the onResize event aparently is not tracked by zone.js
      this.changeDetectorRef.detectChanges()
    }
  }

  private applyClass(elementShouldHaveClass: boolean) {
    const nativeEl: HTMLElement = this.elementRef?.nativeElement
    if (!nativeEl) {
      return
    }

    if (elementShouldHaveClass) {
      nativeEl.classList?.add(this.responsiveClassName)
    } else {
      nativeEl.classList?.remove(this.responsiveClassName)
    }
  }
}
