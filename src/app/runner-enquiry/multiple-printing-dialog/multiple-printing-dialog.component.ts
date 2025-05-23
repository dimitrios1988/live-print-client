import { Component, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { RunnerPrinterService } from '../../runner-printer.service';
import { IRunner } from '../interfaces/runner.interface';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-multiple-printing-dialog',
  imports: [
    MatDialogModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatButtonModule,
    CommonModule,
  ],
  providers: [DatePipe],
  templateUrl: './multiple-printing-dialog.component.html',
  styleUrl: './multiple-printing-dialog.component.css',
})
export class MultiplePrintingDialogComponent {
  public runnerForPrint: IRunner | null = null;
  private readonly dialogRef = inject(
    MatDialogRef<MultiplePrintingDialogComponent>
  );
  constructor(private runnerPrinterService: RunnerPrinterService) {
    this.runnerForPrint = this.runnerPrinterService.runnerForPrint();
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
