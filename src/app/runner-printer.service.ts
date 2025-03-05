import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { IRunner } from './runner-enquiry/interfaces/runner.interface';
import { SettingsService } from './header/settings-dialog/settings.service';
import { PrinterService } from './printer.service';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RunnerPrinterService {
  private _runnerForPrint: WritableSignal<IRunner | null> = signal(null);
  runnerForPrint = computed(this._runnerForPrint);

  constructor(
    private settingsService: SettingsService,
    private printerService: PrinterService,
    private http: HttpClient
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
        ? `Επίπεδο Εγγραφής:<br>${this.runnerForPrint()?.registration_level?.toString()}`
        : '',
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
      variables.tshirt_indicator = '';
    }
    if (this._runnerForPrint()?.receives_as_a_group === true) {
      variables.tshirt_indicator = 'X';
    }
    const htmlContent = await this.loadHTMLTemplate(
      'assets/templates/runner-number.template.html',
      variables
    );
    return this.printerService.printHTML(htmlContent, selectedPrinter, true);
  }

  async printLoadedRunnerTicket(): Promise<{
    success: boolean;
    message: string;
  }> {
    const selectedPrinter = this.settingsService.settings()?.ticketPrinter;
    const variables = {
      bib: this.runnerForPrint()?.bib?.toString() || '',
    };
    const htmlContent = await this.loadHTMLTemplate(
      'assets/templates/runner-ticket.template.html',
      variables
    );
    return this.printerService.printHTML(htmlContent, selectedPrinter, true);
  }

  private async loadHTMLTemplate(
    filePath: string,
    variables: { [key: string]: string }
  ): Promise<string> {
    const template = await firstValueFrom(
      this.http.get(filePath, { responseType: 'text' })
    );
    return this.replaceVariables(template, variables);
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
