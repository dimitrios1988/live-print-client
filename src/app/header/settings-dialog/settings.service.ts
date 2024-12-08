import { Injectable, signal, WritableSignal } from '@angular/core';
import { ISettings } from './settings.interface';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  settings: WritableSignal<ISettings | null> = signal(null);
  constructor() {}

  getSettings(): void {
    (window as any).electronAPI.getSettings().then((settings: ISettings) => {
      this.settings.set(settings);
    });
  }

  saveSettings(settings: ISettings): void {
    (window as any).electronAPI.saveSettings(settings).then(() => {
      this.settings.set(settings);
    });
  }
}
