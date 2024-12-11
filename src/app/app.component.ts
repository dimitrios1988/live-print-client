import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SettingsService } from './header/settings-dialog/settings.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  constructor(settingsService: SettingsService) {
    settingsService.getSettings();
  }
}
