import { Component, effect, inject } from '@angular/core';
import {
  MatDialog,
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

import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LicenseRegistrationComponent } from '../../license-registration/license-registration.component';
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
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './settings-dialog.component.html',
  styleUrl: './settings-dialog.component.css',
})
export class SettingsDialogComponent {
  private readonly dialog: MatDialog;

  printers: Promise<any[]>;
  settingsForm: FormGroup;

  constructor(
    printerService: PrinterService,
    private settingsService: SettingsService,
    fb: FormBuilder,
  ) {
    this.dialog = inject(MatDialog);
    this.printers = printerService.getSystemPrinters();

    this.settingsForm = fb.group({
      apiAddress: ['', Validators.required],
      appName: ['', Validators.required],
      secondaryScreen: [false],
    });

    effect(() => {
      const settings = settingsService.settings() ?? {
        apiAddress: '',
        appName: '',
        secondaryScreen: false,
      };
      if (settings) {
        this.settingsForm.patchValue(settings);
      }
    });
  }

  saveSettings() {
    this.settingsService.saveSettings(this.settingsForm.value);
  }

  openRegistrationDialog() {
    this.dialog.open(LicenseRegistrationComponent, {
      minWidth: '600px',
      minHeight: '400px',
    });
  }

  toggleSecondaryScreen() {
    const currentValue = this.settingsForm.get('secondaryScreen')
      ?.value as boolean;
    if (currentValue === true) {
      (window as any).electronAPI.openSecondWindow();
      setTimeout(() => {
        (window as any).electronAPI.sendToSecondWindow({
          firstName: 'John',
          lastName: 'Doe',
        });
      }, 2000);
    } else {
      (window as any).electronAPI.closeSecondWindow();
    }
    this.settingsService.updateSettings({ secondaryScreen: currentValue });
  }
}
