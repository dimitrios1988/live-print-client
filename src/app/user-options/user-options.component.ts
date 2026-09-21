import { Component, effect } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { UserOptions } from './interfaces/user-options.interface';
import { UserOptionsService } from './user-options.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { EventsService } from '../events/events.service';

@Component({
  selector: 'app-user-options',
  imports: [
    MatToolbarModule,
    MatButtonToggleModule,
    MatIconModule,
    MatTooltipModule,
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
      label: 'Αριθμός',
      icon: 'tag',
      description: 'Εκτύπωση αριθμού δρομέα (bib)',
      formControlName: 'printNumbers',
    },
    {
      value: true,
      label: 'Ετικέτα',
      icon: 'label',
      description: 'Εκτύπωση ετικέτας',
      formControlName: 'printTickets',
    },
    {
      value: true,
      label: 'Συνεχής',
      icon: 'repeat',
      description: 'Συνεχής εκτύπωση: αυτόματη μετάβαση στον επόμενο δρομέα',
      formControlName: 'continuousPrint',
    },
    {
      value: true,
      label: 'Turbo',
      icon: 'bolt',
      description: 'Turbo: αυτόματη εκτύπωση χωρίς επιβεβαίωση',
      formControlName: 'turboPrint',
    },
  ];
  constructor(
    private userOptionsService: UserOptionsService,
    private eventsService: EventsService,
    fb: FormBuilder,
  ) {
    this.userOptions = userOptionsService.getUserOptions();
    this.userOptionsForm = fb.group({
      printNumbers: [],
      printTickets: [],
      continuousPrint: [],
      turboPrint: [],
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
            event.numberPrinter.trim() !== '',
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
            event.ticketPrinter.trim() !== '',
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
    if (this.userOptionsForm.controls['continuousPrint'].value == false) {
      this.userOptionsForm.controls['turboPrint'].setValue(false);
      this.userOptionsForm.controls['turboPrint'].disable();
    } else {
      this.userOptionsForm.controls['turboPrint'].enable();
    }
    this.userOptions = this.userOptionsForm.value;
    this.userOptionsService.setUserOptions(this.userOptions);
  }
}
