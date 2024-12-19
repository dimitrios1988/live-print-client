import { Component } from '@angular/core';
import { UserOptionsComponent } from '../user-options/user-options.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { EventsComponent } from '../events/events.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-print-ui',
  imports: [
    UserOptionsComponent,
    MatSidenavModule,
    EventsComponent,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './print-ui.component.html',
  styleUrl: './print-ui.component.css',
})
export class PrintUiComponent {
  sidemenuOpen = false;
}
