import { computed, inject, Injectable, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private _progressBarActive = signal(false);
  progressBarActive = computed(this._progressBarActive);

  private _snackBar = inject(MatSnackBar);

  constructor() {}

  showProgressBar(show: boolean) {
    this._progressBarActive.set(show);
  }

  displayMessage(message: string, duration: number) {
    this._snackBar.open(message, 'Κλείσιμο', { duration: duration });
  }
}
