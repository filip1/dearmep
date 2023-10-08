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

  public handleUnknownError(error: unknown) {
    console.error("unknown error occurred", error)
    const errorText = this.translocoService.translate("errro.genericError")
    this.matSnackBar.open(errorText, undefined, { })
  }

}
