import { Component, effect, EventEmitter, OnInit, Output } from '@angular/core';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { EventsService } from './events.service';
import { IEvent } from './interfaces/event.interface';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-events',
  imports: [MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent {
  @Output() selectedOptionsChange = new EventEmitter<IEvent[]>();

  public events: IEvent[] = [];
  public selectedEvents: IEvent[] = [];
  constructor(private eventsService: EventsService) {
    effect(() => {
      this.events = eventsService.events();
      this.selectedEvents = this.selectedEvents.filter((event) =>
        this.events.some((e) => e.id === event.id)
      );
      this.selectedOptionsChange.emit(this.selectedEvents);
    });
  }

  refreshEvents() {
    this.eventsService.getEvents();
  }

  canBeSelected(event: IEvent): boolean {
    return [...this.selectedEvents].some(
      (selectedEvent) => selectedEvent.id === event.id
    );
  }

  onSelectionChange($event: MatSelectionListChange) {
    this.selectedEvents = $event.source.selectedOptions.selected.map(
      (option) => option.value
    );
    this.selectedOptionsChange.emit(this.selectedEvents);
  }
}
