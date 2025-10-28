import { Component, inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { IEvent } from '../../interfaces/event.interface';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PrinterService } from '../../../printer.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-event-options-dialog',
  imports: [
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatSlideToggleModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    CommonModule,
  ],
  templateUrl: './event-options-dialog.component.html',
  styleUrls: ['./event-options-dialog.component.css'],
})
export class EventOptionsDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<EventOptionsDialogComponent>);
  readonly event = inject<IEvent>(MAT_DIALOG_DATA);
  printers: Promise<any[]>;
  eventSettingsForm: FormGroup;

  constructor(printerService: PrinterService, fb: FormBuilder) {
    this.printers = printerService.getSystemPrinters();
    this.eventSettingsForm = fb.group({
      numberPrinter: [this.event.numberPrinter ?? ''],
      ticketPrinter: [this.event.ticketPrinter ?? ''],
      enabled: [this.event.enabled],
    });
  }

  ngOnInit() {}

  saveEventSettings() {
    this.event.numberPrinter = this.eventSettingsForm.value.numberPrinter;
    this.event.ticketPrinter = this.eventSettingsForm.value.ticketPrinter;
    this.event.enabled = this.eventSettingsForm.value.enabled;
    this.dialogRef.close(this.event);
  }
}
