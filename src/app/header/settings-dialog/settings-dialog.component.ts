import { Component, effect } from '@angular/core';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { PrinterService } from '../../printer.service';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { SettingsService } from './settings.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-settings-dialog',
  imports: [
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatButtonModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatInputModule,
    CommonModule,
  ],
  templateUrl: './settings-dialog.component.html',
  styleUrl: './settings-dialog.component.css',
})
export class SettingsDialogComponent {
  printers: Promise<any[]>;
  settingsForm: FormGroup;

  constructor(
    printerService: PrinterService,
    private settingsService: SettingsService,
    fb: FormBuilder
  ) {
    this.printers = printerService.getSystemPrinters();

    this.settingsForm = fb.group({
      numberPrinter: [''],
      ticketPrinter: [''],
      apiAddress: ['', Validators.required],
      appName: ['', Validators.required],
    });

    effect(() => {
      this.settingsForm.setValue(
        settingsService.settings() ?? {
          numberPrinter: '',
          ticketPrinter: '',
          apiAddress: '',
          appName: '',
        }
      );
    });
  }

  saveSettings() {
    this.settingsService.saveSettings(this.settingsForm.value);
  }
}
