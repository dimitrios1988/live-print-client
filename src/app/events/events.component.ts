import { Component, effect, inject, Signal } from '@angular/core';
import { EventsService } from './events.service';
import { IEvent } from './interfaces/event.interface';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { EventOptionsDialogComponent } from './event-options-dialog/event-options-dialog/event-options-dialog.component';
import { DIALOG_SIZE } from '../shared/dialog.config';

@Component({
  selector: 'app-events',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent {
  public events: IEvent[] = [];
  readonly loading: Signal<boolean>;

  private dialog: MatDialog = inject(MatDialog);
  constructor(private eventsService: EventsService) {
    this.loading = eventsService.loading;
    effect(() => {
      this.events = eventsService.events();
    });
  }

  refreshEvents() {
    this.eventsService.getEvents();
  }

  toggleEvent(event: IEvent, enabled: boolean) {
    this.eventsService.updateEvent({ ...event, enabled });
  }

  openEventOptionsDialog(event: IEvent) {
    const eventOptionsDialog = this.dialog.open(EventOptionsDialogComponent, {
      ...DIALOG_SIZE.large,
      data: { ...event },
    });

    eventOptionsDialog.afterClosed().subscribe((result: IEvent) => {
      this.eventsService.updateEvent(result);
    });
  }
}
