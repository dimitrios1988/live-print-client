import { Component, effect, EventEmitter, inject, Output } from '@angular/core';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { EventsService } from './events.service';
import { IEvent } from './interfaces/event.interface';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { EventOptionsDialogComponent } from './event-options-dialog/event-options-dialog/event-options-dialog.component';

@Component({
  selector: 'app-events',
  imports: [MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent {
  //@Output() selectedOptionsChange = new EventEmitter<IEvent[]>();

  public events: IEvent[] = [];

  private dialog: MatDialog = inject(MatDialog);
  constructor(private eventsService: EventsService) {
    effect(() => {
      //const selectedEvents = [...this.selectedEvents()];
      this.events = eventsService.events();
      //this.selectedOptionsChange.emit(this.selectedEvents());
    });
  }

  refreshEvents() {
    this.eventsService.getEvents();
  }

  selectedEvents(): IEvent[] {
    return this.events.filter((event) => event.enabled);
  }

  openEventOptionsDialog(event: IEvent) {
    const eventOptionsDialog = this.dialog.open(EventOptionsDialogComponent, {
      minWidth: '600px',
      minHeight: '400px',
      data: { ...event },
    });

    eventOptionsDialog.afterClosed().subscribe((result: IEvent) => {
      this.eventsService.updateEvent(result);
      /* const event = this.events.find((e) => e.id === result.id);
      event!.numberPrinter = result.numberPrinter;
      event!!.ticketPrinter = result.ticketPrinter;
      event!!.enabled = result.enabled; */
      this.eventsService.refreshEvents();
      //this.selectedOptionsChange.emit(this.selectedEvents());
    });
  }
}
