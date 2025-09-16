// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Component, inject } from '@angular/core';
import { ErrorDialogModel } from './error-dialog.model';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'dmep-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss'],
  imports: [
    MatDialogTitle,
    TranslocoModule,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
  ],
})
export class ErrorModalComponent {
  readonly model = inject<ErrorDialogModel>(MAT_DIALOG_DATA);
  private readonly dialogRef =
    inject<MatDialogRef<ErrorModalComponent>>(MatDialogRef);

  public onCancelClick() {
    this.dialogRef.close();
  }
}
