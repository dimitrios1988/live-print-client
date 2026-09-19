import {
  Component,
  computed,
  ElementRef,
  inject,
  Input,
  signal,
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
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
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
import { DIALOG_SIZE } from '../shared/dialog.config';

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
    MatTooltipModule,
  ],
})
export class RunnerEnquiryComponent {
  @Input()
  events: IEvent[] = [];

  enquryForm: FormGroup;

  /** Written from subscribe/promise callbacks, so it has to be a signal. */
  private readonly runnersToPrint = signal<IRunner[]>([]);

  private readonly multiplePrintingDialog: MatDialog;
  private readonly groupDialog: MatDialog;
  @ViewChild('raceNumber') raceNumberInput: ElementRef | undefined;
  @ViewChild('nextButton') nextButton: MatButton | undefined;
  @ViewChild('printButton') printButton: MatButton | undefined;

  /** Written from a setTimeout, so it has to be a signal. */
  readonly printingTimeout = signal(false);

  /**
   * Reads the user options signal, so the print button re-evaluates when the
   * sibling UserOptionsComponent changes what gets printed.
   */
  readonly hasSelectToPrint = computed(() => {
    const options = this.userOptionsService.userOptions();
    return (
      options.printNumbers?.[0] === true || options.printTickets?.[0] === true
    );
  });

  readonly hasNextRunnerToPrint = computed(
    () => this.runnersToPrint().length > 1,
  );

  readonly printTooltip = computed(() => {
    const runner = this.runnerPrinterService.runnerForPrint();
    if (runner === null || runner === undefined) {
      return 'Δεν έχει φορτωθεί δρομέας';
    }
    if (runner.allow_reprinting === false && runner.is_printed === true) {
      return 'Έχει ήδη εκτυπωθεί — δεν επιτρέπεται επανεκτύπωση';
    }
    if (!this.hasSelectToPrint()) {
      return 'Επιλέξτε τι θα εκτυπωθεί (Αριθμός ή Ετικέτα)';
    }
    return 'Εκτύπωση δρομέα';
  });

  readonly nextTooltip = computed(() =>
    this.hasNextRunnerToPrint()
      ? 'Επόμενος δρομέας'
      : 'Δεν υπάρχει επόμενος δρομέας',
  );

  constructor(
    private runnerService: RunnerService,
    private eventService: EventsService,
    public runnerPrinterService: RunnerPrinterService,
    private userOptionsService: UserOptionsService,
    private appService: AppService,
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
    this.runnersToPrint.set([]);
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
            this.events.map((e) => e.id),
          )
          .subscribe({
            next: (runners: IRunner[]) => {
              if (runners !== null && runners.length > 0)
                this.displayGroupDialog(runners)
                  .afterClosed()
                  .subscribe((result: IRunner[]) => {
                    if (
                      result !== null &&
                      result !== undefined &&
                      result.length > 0
                    ) {
                      this.runnersToPrint.set(result);
                      this.runnerPrinterService.loadRunnerForPrint(result[0]);
                    }
                  });
            },
          });
      } else {
        this.runnerService
          .getRunner(
            Number(this.enquryForm.value.raceNumber),
            this.events.map((e) => e.id),
          )
          .subscribe({
            next: (response: IRunner | null | undefined) => {
              if (response !== null && response !== undefined) {
                this.runnersToPrint.set([response]);
                this.runnerPrinterService.loadRunnerForPrint(response);
              } else if (response === undefined) {
                this.runnersToPrint.set([]);
                this.runnerPrinterService.loadRunnerForPrint(undefined);
              } else {
                this.runnersToPrint.set([]);
                this.runnerPrinterService.loadRunnerForPrint(null);
              }
            },
          });
      }
    } else if (this.events?.length === 0) {
      this.appService.displayMessage('Επιλέξτε Αγώνα', 5000);
    }
  }

  onPrint(): void {
    this.printingTimeout.set(true);
    setTimeout(() => {
      this.printingTimeout.set(false);
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
    const [, ...remainingRunners] = this.runnersToPrint();
    this.runnersToPrint.set(remainingRunners);
    this.runnerPrinterService.loadRunnerForPrint(remainingRunners[0]);
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
                  this.runnerPrinterService.runnerForPrint()?.id ?? 0,
                )
                .subscribe({
                  next: (response) => {
                    console.log('Runner set as printed:', response);
                  },
                });
            }
          }
          return result;
        }),
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
              this.runnerPrinterService.updateRunnerForPrint({
                ...runner,
                is_printed: true,
              });
            }
            if (
              this.userOptionsService.getUserOptions().continuousPrint[0] ===
              true
            ) {
              this.loadNextRunner();
              this.printButton?._elementRef.nativeElement.focus();
              if (
                this.userOptionsService.getUserOptions().turboPrint !==
                  undefined &&
                this.userOptionsService.getUserOptions().turboPrint[0] ===
                  true &&
                this.runnersToPrint().length >= 1
              ) {
                setTimeout(() => {
                  this.printButton?._elementRef.nativeElement.click();
                }, 3000);
              }
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

  private displayMultiplePrintingDialog() {
    return this.multiplePrintingDialog.open(
      MultiplePrintingDialogComponent,
      DIALOG_SIZE.large,
    );
  }

  private displayGroupDialog(data: IRunner[]) {
    return this.groupDialog.open(RunnerGroupDialogComponent, {
      ...DIALOG_SIZE.wide,
      data,
    });
  }
}
