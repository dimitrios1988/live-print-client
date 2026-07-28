import { Component, effect } from '@angular/core';
import { RunnerPrintStatus } from './runner-print-status.enum';
import { RunnerPrinterService } from '../runner-printer.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-runner-status',
  imports: [MatIconModule],
  templateUrl: './runner-status.component.html',
  styleUrls: ['./runner-status.component.css'],
})
export class RunnerStatusComponent {
  readonly RunnerPrintStatus = RunnerPrintStatus;
  runnerPrintStatus: RunnerPrintStatus | null = null;

  public receivesAsGroup: boolean = false;

  constructor(private runnerPrinterService: RunnerPrinterService) {
    effect(() => {
      const runner = this.runnerPrinterService.runnerForPrint();
      if (runner === null) {
        this.runnerPrintStatus = null;
        this.receivesAsGroup = false;
      } else if (runner !== undefined) {
        this.receivesAsGroup = runner.receives_as_a_group;
        if (runner.is_printed == true) {
          this.runnerPrintStatus = RunnerPrintStatus.ALREADY_PRINTED;
        } else if (runner.is_printed == false) {
          this.runnerPrintStatus = RunnerPrintStatus.NOT_PRINTED;
        }
      } else {
        this.receivesAsGroup = false;
        this.runnerPrintStatus = RunnerPrintStatus.NOT_FOUND;
      }
    });
  }
}
