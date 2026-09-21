import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { LicenseService } from './license.service';
import { AppService } from '../app.service';
import { ILicense } from './license.interface';

@Component({
  selector: 'app-license-registration',
  imports: [
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    CommonModule,
    MatError,
  ],
  templateUrl: './license-registration.component.html',
  styleUrl: './license-registration.component.css',
})
export class LicenseRegistrationComponent {
  licenseForm: FormGroup;

  /**
   * Signals rather than plain fields: these are written from the promise
   * callbacks in verifyLicense(), which do not mark an OnPush view dirty.
   */
  readonly isVerified = signal(false);
  readonly licenseUser = signal<string | null>(null);
  readonly licenseExpiryDate = signal<Date | null>(null);

  /** Only ever set from the file input's change event, so a plain field is fine. */
  selectedFile: File | null = null;

  constructor(
    fb: FormBuilder,
    private appService: AppService,
    private licenseService: LicenseService,
  ) {
    this.licenseForm = fb.group({
      licenseKey: ['', Validators.required],
    });
    this.syncLicenseState();
  }

  // Method to handle file input change
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  registerLicense() {
    localStorage.setItem('licenseKey', this.licenseForm.value.licenseKey);

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const fileContent = e.target?.result as string;
        localStorage.setItem('licenseFileContent', fileContent);
        this.verifyLicense();
      };
      reader.readAsText(this.selectedFile);
    }
  }

  unregisterLicense() {
    this.licenseService.unregisterLicense();
    this.syncLicenseState();
    this.appService.displayMessage('Η άδεια αφαιρέθηκε.', 5000);
  }

  verifyLicense() {
    try {
      this.licenseService
        .verifyLicense()
        .then((decryptedLicense: ILicense) => {
          console.log('License verified successfully.');
          this.syncLicenseState();
          this.appService.displayMessage(
            'Η άδεια επαληθεύτηκε με επιτυχία.',
            5000,
            'success',
          );
        })
        .catch((error) => {
          this.appService.displayMessage(
            'Η επαλήθευση της άδειας απέτυχε. Παρακαλώ δηλώστε το προϊόν για να μπορέσετε να το χρησιμοποιήσετε.',
            5000,
            'error',
          );
          this.syncLicenseState();
          console.error('License verification failed:', error);
        });
    } catch (e: any) {
      console.error(e);
      this.syncLicenseState();
      this.appService.displayMessage(e, 5000, 'error');
    }
  }

  /** Mirrors the service's current licence state into this component's signals. */
  private syncLicenseState(): void {
    this.isVerified.set(this.licenseService.isVerified);
    this.licenseUser.set(this.licenseService.licenseeInfo?.licenseUser ?? null);
    this.licenseExpiryDate.set(
      this.licenseService.licenseeInfo?.licenseExpiryDate ?? null,
    );
  }
}
