import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { L10nPerferencesService } from 'src/app/services/language/l10n-preferences.service';

@Component({
  selector: 'dmep-language-switch',
  templateUrl: './language-switch.component.html',
  styleUrls: ['./language-switch.component.scss']
})
export class LanguageSwitchComponent implements OnInit {
  public availableLanguages?: string[]
  public selectedLanguage?: string

  constructor(
    private readonly l10nPerfService: L10nPerferencesService,
  ) { }

  public ngOnInit(): void {
    this.l10nPerfService.getAvailableLanguages$().subscribe({
      next: (langs) => {
        this.availableLanguages = langs

        // Timeout (0ms) in order to make sure the language options are rendered to HTML before
        // setting the value of the mat-select input because of rendering issues if this order
        // is not correct.
        setTimeout(() => {
          this.subscribeToSelectedLang()
        }, 0);
      }
    })
  }

  public setLanguage(lang: string) {
    this.l10nPerfService.setLanguage(lang)
  }

  private subscribeToSelectedLang() {
    this.l10nPerfService.getLanguage$().subscribe({
      next: l => {
        this.selectedLanguage = l
      }
    })
  }
}
