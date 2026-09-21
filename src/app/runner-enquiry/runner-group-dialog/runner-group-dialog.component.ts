import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  WritableSignal,
  computed,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { IRunner } from '../interfaces/runner.interface';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from '@angular/cdk/scrolling';

/**
 * Height of a single runner row. Must stay in sync with --row-height in the
 * component stylesheet: the fixed-size virtual scroll strategy positions rows
 * arithmetically, so any mismatch with the rendered height causes drift.
 */
const ROW_HEIGHT = 48;

/** Tallest a single event viewport may grow before it starts scrolling. */
const MAX_VIEWPORT_HEIGHT = 450;

interface RunnerRow {
  runner: IRunner;
  selected: WritableSignal<boolean>;
}

interface EventGroup {
  eventId: number;
  eventName: string;
  rows: RunnerRow[];
  viewportHeight: number;
  /** Whether the viewport will show a scrollbar, so the header can reserve it. */
  scrolls: boolean;
  selectedCount: Signal<number>;
  allSelected: Signal<boolean>;
  partiallySelected: Signal<boolean>;
}

@Component({
  selector: 'app-runner-group-dialog',
  imports: [
    MatDialogModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    ScrollingModule,
  ],
  templateUrl: './runner-group-dialog.component.html',
  styleUrl: './runner-group-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunnerGroupDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RunnerGroupDialogComponent>);
  public data: IRunner[] = inject(MAT_DIALOG_DATA);
  private readonly viewports = viewChildren(CdkVirtualScrollViewport);

  public readonly rowHeight = ROW_HEIGHT;
  public readonly groupName: string;
  public readonly groups: EventGroup[];
  public readonly totalRunners: number;
  public readonly totalSelected: Signal<number>;
  public readonly hasSelection: Signal<boolean>;

  constructor() {
    this.groupName = this.data[0]?.group_name ?? '';
    this.groups = this.buildGroups(this.data);
    this.totalRunners = this.groups.reduce(
      (total, group) => total + group.rows.length,
      0,
    );
    this.totalSelected = computed(() =>
      this.groups.reduce((total, group) => total + group.selectedCount(), 0),
    );
    this.hasSelection = computed(() => this.totalSelected() > 0);

    // The dialog animates in with a transform, and the viewport measures itself
    // with getBoundingClientRect(). Re-measure once the animation has settled.
    this.dialogRef
      .afterOpened()
      .subscribe(() =>
        this.viewports().forEach((viewport) => viewport.checkViewportSize()),
      );
  }

  trackByRunnerId = (_: number, row: RunnerRow): number => row.runner.id;

  toggleGroup(group: EventGroup, checked: boolean): void {
    group.rows.forEach((row) => row.selected.set(checked));
  }

  onCancelClick(): void {
    this.dialogRef.close(null);
  }

  onLoadRunnersClick(): void {
    const runnersToPrint = this.groups
      .flatMap((group) => group.rows)
      .filter((row) => row.selected())
      .map((row) => row.runner)
      .sort((r1, r2) => (r1.bib ?? 0) - (r2.bib ?? 0));
    this.dialogRef.close(runnersToPrint);
  }

  private buildGroups(runners: IRunner[]): EventGroup[] {
    const rowsByEvent = [...runners]
      .sort((r1, r2) => (r1.bib ?? 0) - (r2.bib ?? 0))
      .reduce<Map<number, RunnerRow[]>>((groups, runner) => {
        const rows = groups.get(runner.event_id) ?? [];
        rows.push({
          runner: { ...runner },
          selected: signal(runner.is_printed !== true),
        });
        groups.set(runner.event_id, rows);
        return groups;
      }, new Map());

    return [...rowsByEvent.entries()]
      .sort(([eventId1], [eventId2]) => eventId1 - eventId2)
      .map(([eventId, rows]) => {
        const selectedCount = computed(
          () => rows.filter((row) => row.selected()).length,
        );
        const contentHeight = rows.length * ROW_HEIGHT;
        return {
          eventId,
          eventName: rows[0].runner.event_name,
          rows,
          viewportHeight: Math.min(contentHeight, MAX_VIEWPORT_HEIGHT),
          scrolls: contentHeight > MAX_VIEWPORT_HEIGHT,
          selectedCount,
          allSelected: computed(() => selectedCount() === rows.length),
          partiallySelected: computed(() => {
            const count = selectedCount();
            return count > 0 && count < rows.length;
          }),
        };
      });
  }
}
