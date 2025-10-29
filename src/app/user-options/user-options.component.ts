import { Component, effect } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { UserOptions } from './interfaces/user-options.interface';
import { UserOptionsService } from './user-options.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { EventsService } from '../events/events.service';

@Component({
  selector: 'app-user-options',
  imports: [
    MatToolbarModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    ReactiveFormsModule,
  ],
  templateUrl: './user-options.component.html',
  styleUrl: './user-options.component.css',
})
export class UserOptionsComponent {
  private userOptions: UserOptions;
  userOptionsForm: FormGroup;
  options = [
    {
      value: true,
      label: 'Εκτύπωση Αριθμού',
      formControlName: 'printNumbers',
    },
    {
      value: true,
      label: 'Εκτύπωση Ετικέτας',
      formControlName: 'printTickets',
    },
    {
      value: true,
      label: 'Συνεχής Εκτύπωση',
      formControlName: 'continuousPrint',
    },
  ];
  constructor(
    private userOptionsService: UserOptionsService,
    private eventsService: EventsService,
    fb: FormBuilder
  ) {
    this.userOptions = userOptionsService.getUserOptions();
    this.userOptionsForm = fb.group({
      printNumbers: [],
      printTickets: [],
      continuousPrint: [],
    });

    for (const key in this.userOptions) {
      if (this.userOptions.hasOwnProperty(key)) {
        this.userOptionsForm.patchValue({
          [key]: this.userOptions[key as keyof UserOptions],
        });
      }
    }
    effect(() => {
      this.onSelectionChange();
    });
  }

  onSelectionChange() {
    if (
      this.eventsService
        .selectedEvents()
        .some(
          (event) =>
            event.numberPrinter !== null &&
            event.numberPrinter !== undefined &&
            event.numberPrinter.trim() !== ''
        )
    ) {
      this.userOptionsForm.controls['printNumbers'].enable();
    } else {
      this.userOptionsForm.controls['printNumbers'].setValue(false);
      this.userOptionsForm.controls['printNumbers'].disable();
    }

    if (
      this.eventsService
        .selectedEvents()
        .some(
          (event) =>
            event.ticketPrinter !== null &&
            event.ticketPrinter !== undefined &&
            event.ticketPrinter.trim() !== ''
        )
    ) {
      this.userOptionsForm.controls['printTickets'].enable();
    } else {
      this.userOptionsForm.controls['printTickets'].setValue(false);
      this.userOptionsForm.controls['printTickets'].disable();
    }
    if (
      this.userOptionsForm.controls['printTickets'].value == false &&
      this.userOptionsForm.controls['printNumbers'].value == false
    ) {
      this.userOptionsForm.controls['continuousPrint'].setValue(false);
      this.userOptionsForm.controls['continuousPrint'].disable();
    } else {
      this.userOptionsForm.controls['continuousPrint'].enable();
    }
    this.userOptions = this.userOptionsForm.value;
    this.userOptionsService.setUserOptions(this.userOptions);
  }
}
