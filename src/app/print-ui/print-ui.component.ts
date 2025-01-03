import { Component, inject } from '@angular/core';
import { UserOptionsComponent } from '../user-options/user-options.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { EventsComponent } from '../events/events.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RunnerEnquiryComponent } from '../runner-enquiry/runner-enquiry.component';
import { IEvent } from '../events/interfaces/event.interface';
import { RunnerStatusComponent } from '../runner-status/runner-status.component';
import { RunnerInfoComponent } from '../runner-info/runner-info.component';
@Component({
  selector: 'app-print-ui',
  imports: [
    UserOptionsComponent,
    MatSidenavModule,
    EventsComponent,
    MatButtonModule,
    MatIconModule,
    RunnerEnquiryComponent,
    RunnerStatusComponent,
    RunnerInfoComponent,
  ],
  templateUrl: './print-ui.component.html',
  styleUrl: './print-ui.component.css',
})
export class PrintUiComponent {
  sidemenuOpen = false;
  selectedEvents: IEvent[] = [];

  constructor() {}
  updateSelectedEvents($events: IEvent[]) {
    this.selectedEvents = $events;
  }
}
