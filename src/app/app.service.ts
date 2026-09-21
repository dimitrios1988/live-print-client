import { computed, inject, Injectable, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import config from '../assets/config.json';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private appConfig: any = config;

  constructor() {}

  private _progressBarActive = signal(false);
  progressBarActive = computed(this._progressBarActive);

  private _snackBar = inject(MatSnackBar);

  showProgressBar(show: boolean) {
    this._progressBarActive.set(show);
  }

  displayMessage(
    message: string,
    duration: number,
    type: 'info' | 'success' | 'error' = 'info',
  ) {
    this._snackBar.open(message, 'Κλείσιμο', {
      duration,
      panelClass: `app-snack-${type}`,
    });
  }

  getAppConfig(): any {
    return this.appConfig;
  }
}
