import { Component, Signal } from '@angular/core';
import { UserOptionsComponent } from '../user-options/user-options.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { EventsComponent } from '../events/events.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RunnerEnquiryComponent } from '../runner-enquiry/runner-enquiry.component';
import { IEvent } from '../events/interfaces/event.interface';
import { RunnerStatusComponent } from '../runner-status/runner-status.component';
import { RunnerInfoComponent } from '../runner-info/runner-info.component';
import { EventsService } from '../events/events.service';
import { APP_VERSION } from '../app-version';
@Component({
  selector: 'app-print-ui',
  imports: [
    UserOptionsComponent,
    MatSidenavModule,
    EventsComponent,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RunnerEnquiryComponent,
    RunnerStatusComponent,
    RunnerInfoComponent,
  ],
  templateUrl: './print-ui.component.html',
  styleUrl: './print-ui.component.css',
})
export class PrintUiComponent {
  /**
   * Plain field rather than a signal: it is only ever written by template
   * events (the toggle button and the drawer's two-way binding), and those
   * already mark an OnPush view dirty.
   */
  sidemenuOpen = true;
  readonly appVersion = APP_VERSION;
  readonly selectedEvents: Signal<IEvent[]>;

  constructor(eventsService: EventsService) {
    this.selectedEvents = eventsService.selectedEvents;
  }
}
