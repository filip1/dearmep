import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(
    private readonly translocoService: TranslocoService,
    private readonly matSnackBar: MatSnackBar
  ) {}

  // Handle unknonw errors by simply displaying a generic error message and a console output
  // This should only be called as a last resort when the returned error does not match any of
  // to expected errors.
  public displayUnknownError(error: unknown) {
    console.error("unknown error occurred", error)
    this.showSnackBar("errro.genericError")
  }

  public displayConnectionError() {
    this.showSnackBar("error.genericApiError")
  }

  private showSnackBar(translationKey: string) {
    const errorText = this.translocoService.translate(translationKey)
    this.matSnackBar.open(errorText, undefined, { })
  }
}
