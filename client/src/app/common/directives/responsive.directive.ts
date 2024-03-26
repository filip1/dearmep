import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Input,
  OnInit,
} from '@angular/core';

/**
 * Watches width of dom-element that this decorator is applied to.
 * Applies class to the element if the width drops below the given brakpoint.
 * Can be used as alternative to media queries in cases where using a media-query
 * would not make much sense. This might be because with media-queries it is only
 * possible to apply styles depinding on the dimensions of the viewport not depending
 * on actual component size.
 */
@Directive({
  selector: '[dmepResponsive]',
  standalone: true,
})
export class ResponsiveDirective implements OnInit {
  private resizeObserver?: ResizeObserver;

  /**
   * Describes the breakpoints for this div as object.
   * Each breakpoint consists of a width in px and a class-name.
   * If the monitored element is resized and the width is less than
   * or equal to a given breakpoint the class will be applied to
   * the element.
   * If multiple breakpoints are active at the same time, mutlitple
   * classes will be applied.
   */
  @Input()
  public breakpoints: { [key: string]: number } = {};

  constructor(
    private readonly elementRef: ElementRef,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.resizeObserver = new ResizeObserver(entries => this.onResize(entries));
    if (this.elementRef.nativeElement) {
      this.resizeObserver.observe(this.elementRef.nativeElement);
    }
  }

  private onResize(entries: ResizeObserverEntry[]): void {
    if (entries.length < 1 || entries[0].borderBoxSize.length < 1) {
      return;
    }

    const width = entries[0].borderBoxSize[0].inlineSize;
    let domChanged = false;

    for (const className in this.breakpoints) {
      const bpReached = width <= this.breakpoints[className];
      const changesWereMade = this.applyClass(className, bpReached);
      domChanged = domChanged || changesWereMade;
    }

    // It is necessary to trigger change detection cycle manually
    // as the onResize event aparently is not tracked by zone.js
    if (domChanged) {
      this.changeDetectorRef.detectChanges();
    }
  }

  /**
   * Makes sure a certain class is eitehr present in the classlist of the
   * parent element or not
   * @param className name of the class
   * @param classShouldBePresent wether the class should be present or not
   * @returns true if changes were made to the dom, false otherwise
   */
  private applyClass(
    className: string,
    classShouldBePresent: boolean
  ): boolean {
    const nativeEl: HTMLElement = this.elementRef?.nativeElement;
    if (!nativeEl || !nativeEl.classList) {
      return false;
    }

    if (classShouldBePresent && !nativeEl.classList.contains(className)) {
      nativeEl.classList.add(className);
      return true;
    } else if (
      !classShouldBePresent &&
      nativeEl.classList.contains(className)
    ) {
      nativeEl.classList.remove(className);
      return true;
    }
    return false;
  }
}
