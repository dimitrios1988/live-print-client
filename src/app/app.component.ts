import { Component, effect, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppService } from './app.service';
import { LicenseService } from './license-registration/license.service';
import { MatDialog } from '@angular/material/dialog';
import { LicenseRegistrationComponent } from './license-registration/license-registration.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatProgressBarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  showProgressBar: boolean = false;
  readonly licenseDialog: MatDialog;

  constructor(
    private appService: AppService,
    private licenseService: LicenseService
  ) {
    this.licenseDialog = inject(MatDialog);
    effect(() => {
      this.showProgressBar = appService.progressBarActive();
    });
  }

  ngOnInit(): void {
    try {
      this.licenseService
        .verifyLicense()
        .then(() => {
          console.log('License verified successfully.');
        })
        .catch((error) => {
          this.appService.displayMessage(
            'License verification failed. Please register your license.',
            5000
          );
          console.error('License verification failed:', error);
        });
    } catch (e: any) {
      console.error(e);
      this.appService.displayMessage(e, 5000);
    }
  }
}
