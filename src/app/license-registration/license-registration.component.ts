import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { FileValidators } from 'ngx-file-drag-drop';
import { NgxFileDragDropComponent } from 'ngx-file-drag-drop';
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
    NgxFileDragDropComponent,
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
  constructor(
    fb: FormBuilder,
    private appService: AppService,
    private licenseService: LicenseService
  ) {
    this.licenseForm = fb.group({
      licenseKey: new FormControl('', [Validators.required]),
      licenseFile: new FormControl(
        [],
        [
          FileValidators.required,
          FileValidators.maxFileCount(1),
          FileValidators.fileExtension(['lic']),
        ]
      ),
    });
    this.isVerified = this.licenseService.isVerified;
    this.verifyLicense();
  }

  registerLicense() {
    localStorage.setItem('licenseKey', this.licenseForm.value.licenseKey);
    const file: File = this.licenseForm.value.licenseFile[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const fileContent = e.target?.result as string;
        localStorage.setItem('licenseFileContent', fileContent);
        this.verifyLicense();
      };
      reader.readAsText(file);
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
