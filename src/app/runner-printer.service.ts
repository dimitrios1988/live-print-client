import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { IRunner } from './runner-enquiry/interfaces/runner.interface';
import { SettingsService } from './header/settings-dialog/settings.service';
import { PrinterService } from './printer.service';
import { EventsService } from './events/events.service';
import { IEvent } from './events/interfaces/event.interface';

@Injectable({
  providedIn: 'root',
})
export class RunnerPrinterService {
  private _runnerForPrint: WritableSignal<IRunner | null> = signal(null);
  runnerForPrint = computed(this._runnerForPrint);

  constructor(
    private settingsService: SettingsService,
    private printerService: PrinterService,
    private eventService: EventsService
  ) {}

  loadRunnerForPrint(runner: IRunner | null) {
    this._runnerForPrint.set(runner);
  }

  updateRunnerForPrint(runner: IRunner) {
    this._runnerForPrint.update((prev) => {
      if (prev) {
        return { ...prev, ...runner };
      } else {
        return runner;
      }
    });
  }

  async printLoadedRunnerNumber(): Promise<{
    success: boolean;
    message: string;
  }> {
    const event = this.eventService.events().find((e: IEvent) => {
      return this.runnerForPrint()?.event_id === e.id;
    });
    const selectedPrinter = this.settingsService.settings()?.numberPrinter;
    const variables = {
      bib: this.runnerForPrint()?.bib?.toString() ?? '',
      full_name: `${this.runnerForPrint()?.first_name.toString()} ${this.runnerForPrint()?.last_name.toString()}`,
      block: this.runnerForPrint()?.block
        ? `Block ${this.runnerForPrint()?.block?.toString()}`
        : '',
      club: this.runnerForPrint()?.club
        ? `Σύλλογος:<br>${this.runnerForPrint()?.club?.toString()}`
        : '',
      gender: this.runnerForPrint()?.gender
        ? `Φύλο:<br>${this.runnerForPrint()?.gender?.toString()}`
        : '',
      tshirt_indicator: 'X',
      tshirt_size: '',
      qr: this.runnerForPrint()?.chip_2_go_qr_base64?.toString() ?? '',
      registration_level: this.runnerForPrint()?.registration_level
        ? `Επίπεδο:<br>${this.runnerForPrint()?.registration_level?.toString()}`
        : '',
      frontside_background_url: event?.bib_frontside_background_url || '',
      backside_background_url: event?.bib_backside_background_url || '',
    };
    if (
      this.runnerForPrint()?.tshirt_size !== null &&
      this.runnerForPrint()?.tshirt_size !== undefined &&
      this.runnerForPrint()?.tshirt_size !== '' &&
      this._runnerForPrint()?.has_tshirt === true
    ) {
      variables.tshirt_size = `T-Shirt Size:<br>${
        this.runnerForPrint()?.tshirt_size
      }`;
    }
    if (this._runnerForPrint()?.has_tshirt === true) {
      variables.tshirt_indicator = ' ';
    }
    if (this._runnerForPrint()?.receives_as_a_group === true) {
      variables.tshirt_indicator = 'X';
    }
    let htmlBodyContent = '';
    if (event?.bib_frontside_printing === true) {
      htmlBodyContent += `${event.bib_frontside_template || ''}`;
    }
    if (event?.bib_backside_printing === true) {
      htmlBodyContent += `${event.bib_backside_template || ''}`;
      return this.printerService.printHTML(
        `<html><body><style>${this.replaceVariables(
          event?.bib_styling || '',
          variables
        )}</style>${this.replaceVariables(
          htmlBodyContent,
          variables
        )}</body></html>`,
        selectedPrinter,
        true,
        true
      );
    }
    return this.printerService.printHTML(
      `<html><body><style>${this.replaceVariables(
        event?.bib_styling || '',
        variables
      )}</style>${this.replaceVariables(
        htmlBodyContent,
        variables
      )}</body></html>`,
      selectedPrinter,
      true,
      false
    );
  }

  async printLoadedRunnerTicket(): Promise<{
    success: boolean;
    message: string;
  }> {
    const selectedPrinter = this.settingsService.settings()?.ticketPrinter;
    return this.printerService.printBinary(
      this.runnerForPrint()?.bib?.toString() || '',
      selectedPrinter
    );
  }

  private replaceVariables(
    template: string,
    variables: { [key: string]: string }
  ): string {
    return template.replace(
      /{{\s*(\w+)\s*}}/g,
      (_, key) => variables[key] || ''
    );
  }
}
