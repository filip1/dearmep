import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';

/**
 * This override of angular material functionality is required so that overlays such as drop-down and dialogs
 * are rendered inside of the shadwo-root and not outside as is the default in Angular-CDK.
 *
 * See: https://stackoverflow.com/questions/52763285/add-matdialog-popup-to-angular-root-and-not-to-body
 */
@Injectable()
export class ShadowRootOverlayContainer extends OverlayContainer {
  protected override _createContainer(): void {
    const container: HTMLDivElement = document.createElement('div');
    container.classList.add('cdk-overlay-container');

    // This selector might be problematic with more than one instance of the application embedded into the same page
    // currently it does not seem like there is a use-case with more than one instance on the same page.
    const element: Element | null | undefined = document
      .querySelector('dear-mep')
      ?.shadowRoot?.querySelector('.dmep-app-container');

    if (element) {
      element.appendChild(container);
      this._containerElement = container;
    }
  }
}
