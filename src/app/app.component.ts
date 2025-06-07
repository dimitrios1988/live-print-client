import {
  AfterViewInit,
  Component,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppService } from './app.service';
import { LicenseService } from './license-registration/license.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatProgressBarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  showProgressBar: boolean = false;
  readonly licenseDialog: MatDialog;
  private licenseService: LicenseService = inject(LicenseService);
  constructor(private appService: AppService) {
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
            'Η επαλήθευση της άδειας απέτυχε. Παρακαλώ δηλώστε το προϊόν για να μπορέσετε να το χρησιμοποιήσετε.',
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
