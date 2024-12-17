import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { UserOptions } from './user-options.interface';
import { UserOptionsService } from './user-options.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

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
  ];
  constructor(private userOptionsService: UserOptionsService, fb: FormBuilder) {
    this.userOptions = userOptionsService.getUserOptions();
    this.userOptionsForm = fb.group({
      printNumbers: [],
      printTickets: [],
    });
    this.userOptionsForm.setValue(this.userOptions);
  }

  onSelectionChange() {
    this.userOptions = this.userOptionsForm.value;
    this.userOptionsService.setUserOptions(this.userOptions);
  }
}
