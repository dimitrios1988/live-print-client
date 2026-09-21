import { Component, computed, inject } from '@angular/core';
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

  private readonly runnerPrinterService = inject(RunnerPrinterService);

  /**
   * Derived from the loaded runner rather than mirrored into a field by an
   * effect: `null` means nothing is loaded, `undefined` means the lookup came
   * back empty.
   */
  readonly runnerPrintStatus = computed<RunnerPrintStatus | null>(() => {
    const runner = this.runnerPrinterService.runnerForPrint();
    if (runner === null) {
      return null;
    }
    if (runner === undefined) {
      return RunnerPrintStatus.NOT_FOUND;
    }
    return runner.is_printed
      ? RunnerPrintStatus.ALREADY_PRINTED
      : RunnerPrintStatus.NOT_PRINTED;
  });

  readonly receivesAsGroup = computed(
    () =>
      this.runnerPrinterService.runnerForPrint()?.receives_as_a_group === true,
  );
}
