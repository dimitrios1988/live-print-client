import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';

@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly dialog: MatDialog;

  constructor() {
    this.dialog = inject(MatDialog);
  }

  onSettingsClicked() {
    this.displaySettingsDialog();
  }

  displaySettingsDialog() {
    this.dialog.open(SettingsDialogComponent, {
      minWidth: '600px',
      minHeight: '400px',
    });
  }
}
