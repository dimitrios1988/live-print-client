import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { ISettings } from './settings.interface';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly _settings: WritableSignal<ISettings | null> = signal(null);
  readonly settings = computed(() => this._settings());

  constructor() {
    (window as any).electronAPI.getSettings().then((settings: ISettings) => {
      this._settings.set(settings);
    });
  }

  saveSettings(settings: ISettings): void {
    (window as any).electronAPI.saveSettings(settings).then(() => {
      this._settings.set(settings);
    });
  }
}
