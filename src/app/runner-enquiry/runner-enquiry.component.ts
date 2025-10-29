import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { IEvent } from '../events/interfaces/event.interface';
import { RunnerService } from './runner.service';
import { EventsService } from '../events/events.service';
import { IRunner } from './interfaces/runner.interface';
import { RunnerPrinterService } from '../runner-printer.service';
import { MatIconModule } from '@angular/material/icon';
import { UserOptionsService } from '../user-options/user-options.service';
import { MatDialog } from '@angular/material/dialog';
import { MultiplePrintingDialogComponent } from './multiple-printing-dialog/multiple-printing-dialog.component';
import { RunnerGroupDialogComponent } from './runner-group-dialog/runner-group-dialog.component';
import { AppService } from '../app.service';

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
  private readonly multiplePrintingDialog: MatDialog;
  private readonly groupDialog: MatDialog;
  @ViewChild('raceNumber') raceNumberInput: ElementRef | undefined;
  @ViewChild('printButton') printButton: MatButton | undefined;
  printingTimeout = false;

  constructor(
    private runnerService: RunnerService,
    private eventService: EventsService,
    public runnerPrinterService: RunnerPrinterService,
    private userOptionsService: UserOptionsService,
    private appService: AppService
  ) {
    const fb = inject(FormBuilder);
    this.enquryForm = fb.group({
      raceNumber: ['', Validators.required],
    });
    this.multiplePrintingDialog = inject(MatDialog);
    this.groupDialog = inject(MatDialog);
  }

  onSubmit(): void {
    this.runnerPrinterService.loadRunnerForPrint(null);
    this.eventService.getEvents();
    if (this.enquryForm.valid && this.events?.length > 0) {
      if (
        this.enquryForm.value.raceNumber[0] === '$' &&
        this.enquryForm.value.raceNumber.length > 1
      ) {
        const groupId = Number(this.enquryForm.value.raceNumber.substring(1));
        this.runnerService
          .getGroupRunners(
            groupId,
            this.events.map((e) => e.id)
          )
          .subscribe({
            next: (runners: IRunner[]) => {
              if (runners !== null && runners.length > 0)
                this.displayGroupDialog(runners)
                  .afterClosed()
                  .subscribe((result: IRunner[]) => {
                    if (result !== null && result.length > 0) {
                      this.runnersToPrint = result;
                      this.runnerPrinterService.loadRunnerForPrint(result[0]);
                    }
                  });
            },
          });
      } else {
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
    } else if (this.events?.length === 0) {
      this.appService.displayMessage('Επιλέξτε Αγώνα', 5000);
    }
  }

  onPrint(): void {
    this.printingTimeout = true;
    setTimeout(() => {
      this.printingTimeout = false;
    }, 800);
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
    } else {
      this.printRunner();
      if (
        this.raceNumberInput &&
        this.userOptionsService.getUserOptions().continuousPrint[0] !== true
      ) {
        this.raceNumberInput.nativeElement.focus();
        this.raceNumberInput.nativeElement.select();
      }
    }
  }

  public loadNextRunner() {
    const [currentRunner, ...remainingRunners] = this.runnersToPrint;
    this.runnersToPrint = remainingRunners;
    this.runnerPrinterService.loadRunnerForPrint(this.runnersToPrint[0]);
  }

  private printRunner(): void {
    const options = this.userOptionsService.getUserOptions();
    const printPromises: Promise<{
      success: boolean;
      message: string;
    } | null>[] = [];

    if (options?.printNumbers?.[0] === true) {
      printPromises.push(
        this.runnerPrinterService.printLoadedRunnerNumber().then((result) => {
          if (result?.success) {
            if (this.runnerPrinterService.runnerForPrint() != null) {
              this.runnerService
                .setRunnerAsPrinted(
                  this.runnerPrinterService.runnerForPrint()?.id ?? 0
                )
                .subscribe({
                  next: (response) => {
                    console.log('Runner set as printed:', response);
                  },
                });
            }
          }
          return result;
        })
      );
    }

    if (options?.printTickets?.[0] === true) {
      printPromises.push(this.runnerPrinterService.printLoadedRunnerTicket());
    }

    if (printPromises.length > 0) {
      Promise.all(printPromises)
        .then((results) => {
          if (
            results.filter((result) => result?.success === false).length === 0
          ) {
            const runner = this.runnerPrinterService.runnerForPrint();
            if (runner != null) {
              runner.is_printed = true;
              this.runnerPrinterService.updateRunnerForPrint(runner);
            }
            if (
              this.userOptionsService.getUserOptions().continuousPrint[0] ===
              true
            ) {
              this.loadNextRunner();
              this.printButton?._elementRef.nativeElement.focus();
            } else {
              if (this.raceNumberInput) {
                this.raceNumberInput.nativeElement.focus();
                this.raceNumberInput.nativeElement.select();
              }
            }
          }
        })
        .catch((error) => {
          console.error('An error occurred during printing:', error);
        });
    } else {
      console.log('No print options selected.');
    }
  }

  public hasNextRunnerToPrint(): boolean {
    return this.runnersToPrint.length > 1;
  }

  private displayMultiplePrintingDialog() {
    return this.multiplePrintingDialog.open(MultiplePrintingDialogComponent, {
      minWidth: '800px',
      minHeight: '400px',
    });
  }

  private displayGroupDialog(data: IRunner[]) {
    return this.groupDialog.open(RunnerGroupDialogComponent, {
      minWidth: '800px',
      minHeight: '400px',
      data,
    });
  }

  hasSelectToPrint(): boolean {
    return this.userOptionsService.getUserOptions().printNumbers
      ? this.userOptionsService.getUserOptions().printNumbers[0] === true
      : false || this.userOptionsService.getUserOptions().printTickets
      ? this.userOptionsService.getUserOptions().printTickets[0] === true
      : false;
  }
}
