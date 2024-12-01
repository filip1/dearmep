// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Component, OnInit } from '@angular/core';
import { L10nService } from 'src/app/services/l10n/l10n.service';
import { TranslocoModule } from '@ngneat/transloco';
import { MatOption } from '@angular/material/core';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { MatFormField, MatLabel } from '@angular/material/form-field';

@Component({
  selector: 'dmep-language-switch',
  templateUrl: './language-switch.component.html',
  styleUrls: ['./language-switch.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatSelect,
    MatSelectTrigger,
    MatOption,
    TranslocoModule,
  ],
})
export class LanguageSwitchComponent implements OnInit {
  public availableLanguages?: string[];
  public selectedLanguage?: string;

  constructor(private readonly l10nPerfService: L10nService) {}

  public ngOnInit(): void {
    this.l10nPerfService.getAvailableLanguages$().subscribe({
      next: langs => {
        this.availableLanguages = langs;

        // Timeout (0ms) in order to make sure the language options are rendered to HTML before
        // setting the value of the mat-select input because of rendering issues if this order
        // is not correct.
        setTimeout(() => {
          this.subscribeToSelectedLang();
        }, 0);
      },
    });
  }

  public setLanguage(lang: string) {
    this.l10nPerfService.setLanguage(lang);
  }

  private subscribeToSelectedLang() {
    this.l10nPerfService.getLanguage$().subscribe({
      next: l => {
        this.selectedLanguage = l;
      },
    });
  }
}
