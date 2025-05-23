import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { LoginService } from '../login/login.service';

@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly dialog: MatDialog;

  constructor(private loginserivce: LoginService) {
    this.dialog = inject(MatDialog);
  }

  onSettingsClicked() {
    this.displaySettingsDialog();
  }

  onLogoutClicked() {
    this.loginserivce.logout();
  }

  displaySettingsDialog() {
    this.dialog.open(SettingsDialogComponent, {
      minWidth: '600px',
      minHeight: '400px',
    });
  }
}
