import { Component, Inject } from '@angular/core';
import { ErrorDialogModel } from './error-dialog.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'dmep-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss']
})
export class ErrorModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly model: ErrorDialogModel,
    private readonly dialogRef: MatDialogRef<ErrorModalComponent>,
  ) { }

  public onCancelClick() {
    this.dialogRef.close()
  }
}
