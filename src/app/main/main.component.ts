import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { PrintUiComponent } from '../print-ui/print-ui.component';

@Component({
  selector: 'app-main',
  imports: [HeaderComponent, PrintUiComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {}
