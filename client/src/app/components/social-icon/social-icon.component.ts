// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Component, Input, OnInit } from '@angular/core';
import { MatIconRegistry, MatIcon } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SafePipe } from '../../common/pipes/safe.pipe';
import { MatTooltip } from '@angular/material/tooltip';
import { CdkOverlayOrigin, CdkConnectedOverlay } from '@angular/cdk/overlay';

@Component({
  selector: 'dmep-social-icon',
  templateUrl: './social-icon.component.html',
  styleUrls: ['./social-icon.component.scss'],
  imports: [
    CdkOverlayOrigin,
    MatTooltip,
    MatIcon,
    CdkConnectedOverlay,
    SafePipe,
  ],
})
export class SocialIconComponent implements OnInit {
  public popoverIsOpen = false;

  @Input()
  public type?: string;

  @Input()
  public target?: string;

  public constructor(
    private readonly matIconRegistry: MatIconRegistry,
    private readonly domSanitizer: DomSanitizer
  ) {}

  public ngOnInit(): void {
    // Add icons that are not part of the Material Icon Font here as SVG
    // <mat-icon svgIcon="twitter"></mat-icon> must be used in order to display the svg icons
    // Additional icons can be downloaded from fontawesome.com for free
    this.matIconRegistry.addSvgIconLiteral(
      'twitter',
      this.domSanitizer.bypassSecurityTrustHtml(
        // SPDX-SnippetBegin
        // SPDX-FileCopyrightText: Copyright 2003 Fonticons, Inc.
        // SPDX-License-Identifier: CC-BY-4.0
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M459.4 151.7c.3 4.5 .3 9.1 .3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13 1.6 19.8 1.6 9.4 0 18.8-1.3 27.6-3.6-48.1-9.7-84.1-52-84.1-103v-1.3c14 7.8 30.2 12.7 47.4 13.3-28.3-18.8-46.8-51-46.8-87.4 0-19.5 5.2-37.4 14.3-53 51.7 63.7 129.3 105.3 216.4 109.8-1.6-7.8-2.6-15.9-2.6-24 0-57.8 46.8-104.9 104.9-104.9 30.2 0 57.5 12.7 76.7 33.1 23.7-4.5 46.5-13.3 66.6-25.3-7.8 24.4-24.4 44.8-46.1 57.8 21.1-2.3 41.6-8.1 60.4-16.2-14.3 20.8-32.2 39.3-52.6 54.3z"/></svg>`
        // SPDX-SnippetEnd
      )
    );
    this.matIconRegistry.addSvgIconLiteral(
      'instagram',
      this.domSanitizer.bypassSecurityTrustHtml(
        // SPDX-SnippetBegin
        // SPDX-FileCopyrightText: Copyright 2003 Fonticons, Inc.
        // SPDX-License-Identifier: CC-BY-4.0
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>`
        // SPDX-SnippetEnd
      )
    );
    this.matIconRegistry.addSvgIconLiteral(
      'tiktok',
      this.domSanitizer.bypassSecurityTrustHtml(
        // SPDX-SnippetBegin
        // SPDX-FileCopyrightText: Copyright 2003 Fonticons, Inc.
        // SPDX-License-Identifier: CC-BY-4.0
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"/></svg>`
        // SPDX-SnippetEnd
      )
    );
    this.matIconRegistry.addSvgIconLiteral(
      'mastodon',
      this.domSanitizer.bypassSecurityTrustHtml(
        // SPDX-SnippetBegin
        // SPDX-FileCopyrightText: Copyright 2003 Fonticons, Inc.
        // SPDX-License-Identifier: CC-BY-4.0
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M433 179.1c0-97.2-63.7-125.7-63.7-125.7-62.5-28.7-228.6-28.4-290.5 0 0 0-63.7 28.5-63.7 125.7 0 115.7-6.6 259.4 105.6 289.1 40.5 10.7 75.3 13 103.3 11.4 50.8-2.8 79.3-18.1 79.3-18.1l-1.7-36.9s-36.3 11.4-77.1 10.1c-40.4-1.4-83-4.4-89.6-54a102.5 102.5 0 0 1 -.9-13.9c85.6 20.9 158.7 9.1 178.8 6.7 56.1-6.7 105-41.3 111.2-72.9 9.8-49.8 9-121.5 9-121.5zm-75.1 125.2h-46.6v-114.2c0-49.7-64-51.6-64 6.9v62.5h-46.3V197c0-58.5-64-56.6-64-6.9v114.2H90.2c0-122.1-5.2-147.9 18.4-175 25.9-28.9 79.8-30.8 103.8 6.1l11.6 19.5 11.6-19.5c24.1-37.1 78.1-34.8 103.8-6.1 23.7 27.3 18.4 53 18.4 175z"/></svg>`
        // SPDX-SnippetEnd
      )
    );
    // facebook is already present
  }

  public getIcon(): string {
    switch (this.type) {
      case 'phone':
        return 'call';
      case 'email':
        return 'mail';
      case 'web':
        return 'web';
      default:
        return this.type || 'public';
    }
  }

  public useSvgIcon(): boolean {
    return (
      this.type !== 'web' &&
      this.type !== 'phone' &&
      this.type !== 'email' &&
      this.type !== 'fax' &&
      this.type !== 'facebook'
    );
  }

  public getText(): string {
    return this.target || '';
  }

  public getTarget(): string {
    switch (this.type) {
      case 'email':
        return `mailto:${this.target}`;
      case 'phone':
        return `tel:${this.target}`;
      case 'fax':
        return `fax:${this.target}`;
      default:
        return this.target || '';
    }
  }

  public usePopover(): boolean {
    return (
      this.type === 'email' || this.type === 'phone' || this.type === 'fax'
    );
  }

  public togglePopover() {
    this.popoverIsOpen = !this.popoverIsOpen;
  }
}
