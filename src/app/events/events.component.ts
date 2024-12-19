import { Component, effect, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { EventsService } from './events.service';
import { IEvent } from './interfaces/event.interface';
@Component({
  selector: 'app-events',
  imports: [MatListModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent implements OnInit {
  public events: IEvent[] = [];
  constructor(private eventsService: EventsService) {
    effect(() => {
      this.events = eventsService.events();
    });
  }
  ngOnInit(): void {}
}
