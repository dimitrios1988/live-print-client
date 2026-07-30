import { Component, OnInit, NgZone, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IRunner } from '../runner-enquiry/interfaces/runner.interface';
import { RunnerPrintStatus } from '../runner-status/runner-print-status.enum';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { TranslationService } from '../shared/i18n/translation.service';

@Component({
  selector: 'app-secondary',
  templateUrl: './secondary.component.html',
  styleUrls: ['./secondary.component.css'],
  imports: [MatDividerModule, MatIconModule, CommonModule],
  providers: [DatePipe],
})
export class SecondaryComponent implements OnInit {
  readonly RunnerPrintStatus = RunnerPrintStatus;
  runner: IRunner | null = null;
  runnerPrintStatus: RunnerPrintStatus | null = null;

  private readonly translationService = inject(TranslationService);

  /** Static text for the runner's language. See TranslationService. */
  readonly t = this.translationService.dictionary;

  constructor(private ngZone: NgZone) {}

  /**
   * The event name in the runner's language, falling back to the Greek name
   * for events the API has no English name for.
   */
  get eventName(): string {
    if (this.runner === null || this.runner === undefined) {
      return '';
    }
    const englishName = this.runner.event_name_en;
    return this.translationService.language() === 'en' && englishName
      ? englishName
      : this.runner.event_name;
  }

  ngOnInit() {
    (window as any).electronAPI.onReceiveData((data: IRunner) => {
      this.ngZone.run(() => {
        this.runner = data;
        this.translationService.setLanguageFromNationality(data?.nationality);

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
