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

  loadRunnerForPrint(runner: IRunner) {
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
      title: 'Dynamic Print Example',
      description:
        'This is a dynamic description loaded from an external file.',
    };
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
