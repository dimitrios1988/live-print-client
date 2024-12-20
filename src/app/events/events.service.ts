import {
  computed,
  effect,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { SettingsService } from '../header/settings-dialog/settings.service';
import { IEvent } from './interfaces/event.interface';
import { LoginService } from '../login/login.service';
@Injectable({
  providedIn: 'root',
  deps: [],
})
export class EventsService {
  private appName: string = '';
  private apiAddress: string = '';
  private _events: WritableSignal<IEvent[]> = signal([]);
  events: Signal<IEvent[]> = computed(() => this._events());
  constructor(
    settingsService: SettingsService,
    private httpClient: HttpClient,
    loginService: LoginService
  ) {
    effect(() => {
      this.appName = settingsService.settings()?.appName || '';
      this.apiAddress = settingsService.settings()?.apiAddress || '';
      if (
        this.appName !== '' &&
        this.apiAddress != '' &&
        loginService.isAuthenticated()
      ) {
        this.getEvents();
      }
    });
  }

  getEvents(): void {
    this.httpClient
      .get<IEvent[]>(`${this.apiAddress}/api/${this.appName}/events/v1`)
      .subscribe({
        next: (response) => {
          this._events.set(response);
        },
      });
  }
}
