import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
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
    CommonModule,
    MatError,
  ],
  templateUrl: './license-registration.component.html',
  styleUrl: './license-registration.component.css',
})
export class LicenseRegistrationComponent {
  licenseForm: FormGroup;
  isVerified = false;
  licenseUser: string | null = null;
  licenseExpiryDate: Date | null = null;
  selectedFile: File | null = null;

  constructor(
    fb: FormBuilder,
    private appService: AppService,
    private licenseService: LicenseService
  ) {
    this.licenseForm = fb.group({
      licenseKey: ['', Validators.required],
    });
    this.isVerified = this.licenseService.isVerified;
    this.licenseUser = this.licenseService.licenseeInfo?.licenseUser || null;
    this.licenseExpiryDate =
      this.licenseService.licenseeInfo?.licenseExpiryDate || null;
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
    this.isVerified = false;
    this.licenseUser = null;
    this.licenseExpiryDate = null;
    localStorage.removeItem('licenseKey');
    localStorage.removeItem('licenseFileContent');
    this.appService.displayMessage('Η άδεια αφαιρέθηκε.', 5000);
  }

  verifyLicense() {
    try {
      this.licenseService
        .verifyLicense()
        .then((decryptedLicense: ILicense) => {
          console.log('License verified successfully.');
          this.isVerified = this.licenseService.isVerified;
          this.licenseUser =
            this.licenseService.licenseeInfo?.licenseUser || null;
          this.licenseExpiryDate =
            this.licenseService.licenseeInfo?.licenseExpiryDate || null;
          this.appService.displayMessage(
            'Η άδεια επαληθεύτηκε με επιτυχία.',
            5000
          );
        })
        .catch((error) => {
          this.appService.displayMessage(
            'Η επαλήθευση της άδειας απέτυχε. Παρακαλώ δηλώστε το προϊόν για να μπορέσετε να το χρησιμοποιήσετε.',
            5000
          );
          this.isVerified = this.licenseService.isVerified;
          this.licenseUser =
            this.licenseService.licenseeInfo?.licenseUser || null;
          this.licenseExpiryDate =
            this.licenseService.licenseeInfo?.licenseExpiryDate || null;
          console.error('License verification failed:', error);
        });
    } catch (e: any) {
      console.error(e);
      this.isVerified = this.licenseService.isVerified;
      this.licenseUser = this.licenseService.licenseeInfo?.licenseUser || null;
      this.licenseExpiryDate =
        this.licenseService.licenseeInfo?.licenseExpiryDate || null;
      this.appService.displayMessage(e, 5000);
    }
  }
}
