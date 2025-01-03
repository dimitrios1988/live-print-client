import {
  Component,
  computed,
  ElementRef,
  inject,
  Input,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { IEvent } from '../events/interfaces/event.interface';
import { RunnerService } from './runner.service';
import { EventsService } from '../events/events.service';
import { IRunner } from './interfaces/runner.interface';
import { RunnerPrinterService } from '../runner-printer.service';
import { MatIconModule } from '@angular/material/icon';
import { UserOptionsService } from '../user-options/user-options.service';
import { MatDialog } from '@angular/material/dialog';
import { MultiplePrintingDialogComponent } from './multiple-printing-dialog/multiple-printing-dialog.component';

@Component({
  selector: 'app-runner-enquiry',
  templateUrl: './runner-enquiry.component.html',
  styleUrls: ['./runner-enquiry.component.css'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
  ],
})
export class RunnerEnquiryComponent {
  @Input()
  events: IEvent[] = [];

  enquryForm: FormGroup;
  private runnersToPrint: IRunner[] = [];
  private readonly dialog: MatDialog;
  @ViewChild('raceNumber') raceNumberInput: ElementRef | undefined;

  constructor(
    private fb: FormBuilder,
    private runnerService: RunnerService,
    private eventService: EventsService,
    public runnerPrinterService: RunnerPrinterService,
    private userOptionsService: UserOptionsService
  ) {
    this.enquryForm = this.fb.group({
      raceNumber: ['', Validators.required],
    });
    this.dialog = inject(MatDialog);
  }

  onSubmit(): void {
    this.eventService.getEvents();
    if (this.enquryForm.valid && this.events?.length > 0) {
      this.runnerService
        .getRunner(
          Number(this.enquryForm.value.raceNumber),
          this.events.map((e) => e.id)
        )
        .subscribe({
          next: (response: IRunner) => {
            this.runnersToPrint = [response];
            this.runnerPrinterService.loadRunnerForPrint(response);
          },
        });
    }
  }

  onPrint(): void {
    if (this.runnerPrinterService.runnerForPrint()?.is_printed === true) {
      const dialog = this.displayMultiplePrintingDialog();
      dialog.afterClosed().subscribe((result) => {
        if (result === true) {
          this.printRunner();
        }
        if (
          this.raceNumberInput &&
          this.userOptionsService.getUserOptions().continuousPrint[0] !== true
        ) {
          this.raceNumberInput.nativeElement.focus();
          this.raceNumberInput.nativeElement.select();
        }
      });
    }
    if (this.userOptionsService.getUserOptions().continuousPrint[0] === true) {
      this.loadNextRunner();
    } else {
      if (this.raceNumberInput) {
        this.raceNumberInput.nativeElement.focus();
        this.raceNumberInput.nativeElement.select();
      }
    }
  }

  loadNextRunner() {
    const [currentRunner, ...remainingRunners] = this.runnersToPrint;
    this.runnersToPrint = remainingRunners;
    this.runnerPrinterService.loadRunnerForPrint(this.runnersToPrint[0]);
  }

  printRunner(): void {
    const options = this.userOptionsService.getUserOptions();
    const promises: Promise<{ success: boolean; message: string }>[] = [];

    if (options?.printNumbers?.[0] === true) {
      promises.push(
        this.runnerPrinterService.printLoadedRunnerNumber().then((result) => {
          if (result.success) {
            if (this.runnerPrinterService.runnerForPrint() != null) {
              this.runnerService
                .setRunnerAsPrinted(
                  this.runnerPrinterService.runnerForPrint()?.id ?? 0
                )
                .subscribe({
                  next: (response) => {
                    console.log('Runner set as printed:', response);
                    const runner = this.runnerPrinterService.runnerForPrint();
                    if (runner != null) {
                      runner.is_printed = true;
                      this.runnerPrinterService.updateRunnerForPrint(runner);
                    }
                  },
                });
            }
          }
          return result;
        })
      );
    }

    if (options?.printTickets?.[0] === true) {
      promises.push(this.runnerPrinterService.printLoadedRunnerTicket());
    }

    if (promises.length > 0) {
      Promise.all(promises)
        .then((results) => {
          results.forEach((result) => {
            if (!result.success) {
              console.error(result.message);
            }
          });
        })
        .catch((error) => {
          console.error('An error occurred during printing:', error);
        });
    } else {
      console.log('No print options selected.');
    }
  }

  displayMultiplePrintingDialog() {
    const dialog = this.dialog.open(MultiplePrintingDialogComponent, {
      minWidth: '600px',
      minHeight: '400px',
    });
    return dialog;
  }
}
