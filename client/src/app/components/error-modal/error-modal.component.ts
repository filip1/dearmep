import { Component, Inject } from '@angular/core';
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
  standalone: true,
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
  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly model: ErrorDialogModel,
    private readonly dialogRef: MatDialogRef<ErrorModalComponent>
  ) {}

  public onCancelClick() {
    this.dialogRef.close();
  }
}
