import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatProgressBarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  showProgressBar: boolean = false;

  constructor(appService: AppService) {
    effect(() => {
      this.showProgressBar = appService.progressBarActive();
    });
  }
}
