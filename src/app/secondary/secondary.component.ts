import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IRunner } from '../runner-enquiry/interfaces/runner.interface';
import { RunnerPrintStatus } from '../runner-status/runner-print-status.enum';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-secondary',
  templateUrl: './secondary.component.html',
  styleUrls: ['./secondary.component.css'],
  imports: [MatDividerModule, CommonModule],
  providers: [DatePipe],
})
export class SecondaryComponent implements OnInit {
  runner: IRunner | null = null;
  runnerPrintStatus: RunnerPrintStatus | null = null;

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    (window as any).electronAPI.onReceiveData((data: IRunner) => {
      this.ngZone.run(() => {
        this.runner = data;

        if (this.runner === null) {
          this.runnerPrintStatus = null;
        } else if (this.runner !== undefined) {
          if (this.runner.is_printed == true) {
            this.runnerPrintStatus = RunnerPrintStatus.ALREADY_PRINTED;
          } else if (this.runner.is_printed == false) {
            this.runnerPrintStatus = RunnerPrintStatus.NOT_PRINTED;
          }
        } else {
          this.runnerPrintStatus = RunnerPrintStatus.NOT_FOUND;
        }
      });
    });
  }
}
