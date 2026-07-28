import { Component, inject } from '@angular/core';
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
import { MatTableModule } from '@angular/material/table';
import { IRunner } from '../interfaces/runner.interface';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ScrollingModule } from '@angular/cdk/scrolling';

type GroupedRunner = IRunner & { selected: boolean };

@Component({
  selector: 'app-runner-group-dialog',
  imports: [
    MatDialogModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatButtonModule,
    MatTableModule,
    MatCheckboxModule,
    FormsModule,
    MatIconModule,
    ScrollingModule,
  ],
  templateUrl: './runner-group-dialog.component.html',
  styleUrl: './runner-group-dialog.component.css',
})
export class RunnerGroupDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RunnerGroupDialogComponent>);
  public data: IRunner[] = inject(MAT_DIALOG_DATA);
  public runnersGroupedByEventArray: GroupedRunner[][] = [];
  displayedColumns: string[] = [
    'selected',
    'bib',
    'last_name',
    'first_name',
    'nationality',
    'gender',
    'is_printed',
  ];

  constructor() {
    const runnersGroupedByEvent = this.data
      .sort((r1, r2) => (r1.bib ?? 0) - (r2.bib ?? 0))
      .map<GroupedRunner>((runner: IRunner) => ({
        ...runner,
        selected: runner.is_printed !== true,
      }))
      .reduce<Record<number, GroupedRunner[]>>((groups, runner) => {
        const group = groups[runner.event_id] || [];
        group.push(runner);
        groups[runner.event_id] = group;
        return groups;
      }, {});
    this.runnersGroupedByEventArray = Object.keys(runnersGroupedByEvent).map(
      (key: string) => runnersGroupedByEvent[Number(key)],
    );
  }

  onCancelClick(): void {
    this.dialogRef.close(null);
  }

  onLoadRunnersClick(): void {
    const runnersToPrint = this.runnersGroupedByEventArray
      .flatMap((group) => group.filter((runner) => runner.selected))
      .map(({ selected, ...runner }) => runner as IRunner)
      .sort((r1, r2) => (r1.bib ?? 0) - (r2.bib ?? 0));
    this.dialogRef.close(runnersToPrint);
  }

  partiallySelected(groupOfRunners: GroupedRunner[]): boolean {
    const selectedCount = groupOfRunners.filter((r) => r.selected).length;
    return selectedCount > 0 && selectedCount < groupOfRunners.length;
  }

  allSelected(groupOfRunners: GroupedRunner[]): boolean {
    return (
      groupOfRunners.length > 0 && groupOfRunners.every((r) => r.selected)
    );
  }

  updateSelectedRunners(checked: boolean, groupOfRunners: GroupedRunner[]): void {
    groupOfRunners.forEach((runner) => (runner.selected = checked));
  }

  hasRunnersSelected(): boolean {
    return this.runnersGroupedByEventArray.some((group) =>
      group.some((runner) => runner.selected),
    );
  }

  getNumberOfEventSelectedRunners(groupOfRunners: GroupedRunner[]): number {
    return groupOfRunners.filter((r) => r.selected).length;
  }

  getNumberOfTotalSelectedRunners(): number {
    return this.runnersGroupedByEventArray.reduce(
      (total, group) => total + group.filter((r) => r.selected).length,
      0,
    );
  }

  getNumberOfTotalRunners(): number {
    return this.runnersGroupedByEventArray.reduce(
      (total, group) => total + group.length,
      0,
    );
  }
}
