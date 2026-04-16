import {
  computed,
  Injectable,
  NgZone,
  signal,
  WritableSignal,
} from '@angular/core';
import { ISettings } from './settings.interface';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly _settings: WritableSignal<ISettings | null> = signal(null);
  readonly settings = computed(() => this._settings());

  constructor(private ngZone: NgZone) {
    (window as any).electronAPI.getSettings().then((settings: ISettings) => {
      this._settings.set(settings);
      if (settings.secondaryScreen) {
        (window as any).electronAPI.openSecondWindow();
      }
    });
    (window as any).electronAPI.onSecondaryWindowClosed(() => {
      this.ngZone.run(() => {
        this._settings.update((s) =>
          s ? { ...s, secondaryScreen: false } : s,
        );
        this.updateSettings({ secondaryScreen: false });
      });
    });
  }

  saveSettings(settings: ISettings): void {
    (window as any).electronAPI.saveSettings(settings).then(() => {
      this._settings.set(settings);
    });
  }

  updateSettings(partialSettings: Partial<ISettings>): void {
    (window as any).electronAPI.saveSettings({
      ...this._settings(),
      ...partialSettings,
    });
  }
}
