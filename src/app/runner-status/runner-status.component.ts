import { Component, effect } from '@angular/core';
import { RunnerPrintStatus } from './runner-print-status.enum';
import { RunnerPrinterService } from '../runner-printer.service';

@Component({
  selector: 'app-runner-status',
  templateUrl: './runner-status.component.html',
  styleUrls: ['./runner-status.component.css'],
})
export class RunnerStatusComponent {
  runnerPrintStatus: RunnerPrintStatus | null = null;

  constructor(private runnerPrinterService: RunnerPrinterService) {
    effect(() => {
      const runner = this.runnerPrinterService.runnerForPrint();
      if (runner === null) {
        this.runnerPrintStatus = null;
      } else if (runner !== undefined) {
        if (runner.is_printed == true) {
          this.runnerPrintStatus = RunnerPrintStatus.ALREADY_PRINTED;
        } else if (runner.is_printed == false) {
          this.runnerPrintStatus = RunnerPrintStatus.NOT_PRINTED;
        }
      } else {
        this.runnerPrintStatus = RunnerPrintStatus.NOT_FOUND;
      }
    });
  }
}
