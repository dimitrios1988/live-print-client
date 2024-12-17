import { Component } from '@angular/core';
import { UserOptionsComponent } from '../user-options/user-options.component';

@Component({
  selector: 'app-print-ui',
  imports: [UserOptionsComponent],
  templateUrl: './print-ui.component.html',
  styleUrl: './print-ui.component.css',
})
export class PrintUiComponent {}
