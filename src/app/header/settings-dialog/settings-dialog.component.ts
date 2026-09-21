import { Component, effect, inject } from '@angular/core';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { SettingsService } from './settings.service';

import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LicenseRegistrationComponent } from '../../license-registration/license-registration.component';
import { DIALOG_SIZE } from '../../shared/dialog.config';
@Component({
  selector: 'app-settings-dialog',
  imports: [
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatSlideToggleModule,
  ],
  templateUrl: './settings-dialog.component.html',
  styleUrl: './settings-dialog.component.css',
})
export class SettingsDialogComponent {
  private readonly dialog = inject(MatDialog);

  settingsForm: FormGroup;

  constructor(
    private settingsService: SettingsService,
    fb: FormBuilder,
  ) {
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
    this.dialog.open(LicenseRegistrationComponent, DIALOG_SIZE.medium);
  }

  toggleSecondaryScreen() {
    const enabled = this.settingsForm.get('secondaryScreen')?.value as boolean;
    if (enabled === true) {
      (window as any).electronAPI.openSecondWindow();
    } else {
      (window as any).electronAPI.closeSecondWindow();
    }
    this.settingsService.updateSettings({ secondaryScreen: enabled });
  }
}
