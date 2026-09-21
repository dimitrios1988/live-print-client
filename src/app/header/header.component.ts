import { Component, computed, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { LoginService } from '../login/login.service';
import { SettingsService } from './settings-dialog/settings.service';
import { DIALOG_SIZE } from '../shared/dialog.config';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly dialog = inject(MatDialog);
  private readonly loginService = inject(LoginService);
  private readonly settingsService = inject(SettingsService);

  readonly appName = computed(() => 'LivePrint Client');

  onSettingsClicked() {
    this.dialog.open(SettingsDialogComponent, DIALOG_SIZE.medium);
  }

  onLogoutClicked() {
    this.loginService.logout();
  }
}
