import { Component, computed, inject, NgZone, OnInit, signal } from '@angular/core';
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

  private readonly translationService = inject(TranslationService);
  private readonly ngZone = inject(NgZone);

  /** Static text for the runner's language. See TranslationService. */
  readonly t = this.translationService.dictionary;

  /**
   * Written from the Electron IPC callback in ngOnInit. This has to be a
   * signal: ngZone.run() schedules change detection but does not mark an
   * OnPush view dirty, so a plain field would leave this window stale.
   */
  private readonly _runner = signal<IRunner | null | undefined>(null);
  readonly runner = this._runner.asReadonly();

  readonly runnerPrintStatus = computed<RunnerPrintStatus | null>(() => {
    const runner = this._runner();
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

  /**
   * The event name in the runner's language, falling back to the Greek name
   * for events the API has no English name for.
   */
  readonly eventName = computed(() => {
    const runner = this._runner();
    if (runner === null || runner === undefined) {
      return '';
    }
    const englishName = runner.event_name_en;
    return this.translationService.language() === 'en' && englishName
      ? englishName
      : runner.event_name;
  });

  /** True when a runner is loaded and picks up as part of a group. */
  readonly receivesAsGroup = computed(
    () => this._runner()?.receives_as_a_group === true,
  );

  /** Whether any banner is shown — keeps the banner row out of the flex flow when empty. */
  readonly showBanners = computed(() => {
    const status = this.runnerPrintStatus();
    return (
      status === RunnerPrintStatus.ALREADY_PRINTED ||
      status === RunnerPrintStatus.NOT_FOUND ||
      this.receivesAsGroup()
    );
  });

  /** The runner, but only once there is something worth showing details for. */
  readonly displayedRunner = computed(() => {
    const runner = this._runner();
    const status = this.runnerPrintStatus();
    return runner !== null &&
      runner !== undefined &&
      (status === RunnerPrintStatus.NOT_PRINTED ||
        status === RunnerPrintStatus.ALREADY_PRINTED)
      ? runner
      : null;
  });

  ngOnInit() {
    (window as any).electronAPI.onReceiveData((data: IRunner) => {
      this.ngZone.run(() => {
        this._runner.set(data);
        this.translationService.setLanguageFromNationality(data?.nationality);
      });
    });
  }
}
