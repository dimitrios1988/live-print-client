import {
  computed,
  effect,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '../header/settings-dialog/settings.service';
import { IEvent } from './interfaces/event.interface';
import { IGetEventResponse } from './interfaces/get-event.resp';
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
    private loginService: LoginService
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
      .get<IGetEventResponse[]>(
        `${this.apiAddress}/api/${this.appName}/events/v1`
      )
      .subscribe({
        next: (response) => {
          this._events.set(
            response.map((e: IGetEventResponse) => {
              return {
                name: e['0(event)'].name,
                name_for_printing: e['0(event)'].printed_text,
                allow_reprinting: e['0(event)'].allow_reprinting,
                id: e['0(event)'].id,
                bib_frontside_background_url: e['0(event)']
                  .bib_frontside_background
                  ? `${this.apiAddress}/data/download/${this.appName}/${
                      e['0(event)'].bib_frontside_background?.[0]?.name || ''
                    }?attribute_id=6b9eef38-f441-4d13-b36f-70bc1ed8ca4e&file_id=${
                      e['0(event)'].bib_frontside_background?.[0]?.id || ''
                    }&version=${
                      e['0(event)'].bib_frontside_background?.[0]?.version || ''
                    }&token=${this.loginService.getToken()}`
                  : null,
                bib_backside_background_url: e['0(event)']
                  .bib_backside_background
                  ? `${this.apiAddress}/data/download/${this.appName}/${
                      e['0(event)'].bib_backside_background?.[0]?.name
                    }?attribute_id=1d4f01fd-924e-48c2-8f21-5ac00d3e8aca&file_id=${
                      e['0(event)'].bib_backside_background?.[0]?.id || ''
                    }&version=${
                      e['0(event)'].bib_backside_background?.[0]?.version
                    }&token=${this.loginService.getToken()}`
                  : null,
                bib_backside_printing: e['0(event)'].bib_backside_printing,
                bib_frontside_printing: e['0(event)'].bib_frontside_printing,
                bib_backside_template:
                  e['0(event)'].bib_backside_template || null,
                bib_frontside_template:
                  e['0(event)'].bib_frontside_template || null,
                bib_styling: e['0(event)'].bib_styling || null,
                has_timing: e['0(event)'].has_timing,
              } as IEvent;
            })
          );
        },
      });
  }
}
