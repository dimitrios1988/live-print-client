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
  events: Signal<IEvent[]> = computed(() => this._events());

  private appName: string = '';
  private apiAddress: string = '';
  private _events: WritableSignal<IEvent[]> = signal([]);
  private _loading: WritableSignal<boolean> = signal(false);
  readonly loading: Signal<boolean> = computed(() => this._loading());
  selectedEvents: Signal<IEvent[]> = computed(() =>
    this._events().filter((e) => e.enabled),
  ) as Signal<IEvent[]>;
  constructor(
    settingsService: SettingsService,
    private httpClient: HttpClient,
    loginService: LoginService,
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
    this._loading.set(true);
    this.httpClient
      .get<
        IGetEventResponse[]
      >(`${this.apiAddress}/api/${this.appName}/events/v1`)
      .subscribe({
        next: (response) => {
          this._events.set(
            response.map((e: IGetEventResponse) => {
              return {
                name: e['0(event)'].name,
                name_for_printing: e['0(event)'].printed_text,
                name_for_printing_en: e['0(event)'].printed_text_en,
                allow_reprinting: e['0(event)'].allow_reprinting,
                id: e['0(event)'].id,
                bib_backside_printing: e['0(event)'].bib_backside_printing,
                bib_frontside_printing: e['0(event)'].bib_frontside_printing,
                label_template: e['3(label_template)']?.label_template || null,
                enabled: this.selectedEvents().some(
                  (se) => se.id === e['0(event)'].id,
                ),
                numberPrinter:
                  this.selectedEvents().find((se) => se.id === e['0(event)'].id)
                    ?.numberPrinter || null,
                ticketPrinter:
                  this.selectedEvents().find((se) => se.id === e['0(event)'].id)
                    ?.ticketPrinter || null,
              } as IEvent;
            }),
          );
          this._loading.set(false);
        },
        error: () => {
          this._loading.set(false);
        },
      });
  }

  updateEvent(updatedEvent: IEvent): void {
    if (updatedEvent !== undefined && updatedEvent !== null) {
      this._events.update((events) => {
        const index = events.findIndex((e) => e.id === updatedEvent.id);
        if (index !== -1) {
          events[index] = updatedEvent;
        }
        return events;
      });
      this._events.set([...this._events()]);
    }
  }
}
