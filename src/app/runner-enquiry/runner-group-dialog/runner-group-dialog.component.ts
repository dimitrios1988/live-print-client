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
  ],
  templateUrl: './runner-group-dialog.component.html',
  styleUrl: './runner-group-dialog.component.css',
})
export class RunnerGroupDialogComponent {

  private readonly dialogRef = inject(MatDialogRef<RunnerGroupDialogComponent>);
  public data: IRunner[] = inject(MAT_DIALOG_DATA);
  public runnersGroupedByEventArray: any[] = [];
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
      .sort((r1, r2) => {
        return r1.bib - r2.bib;
      })
      .map<any>((runner: IRunner) => {
        if (runner.is_printed === true) {
          return { ...runner, selected: false };
        } else {
          return { ...runner, selected: true };
        }
      })
      .reduce((groups, runner) => {
        const group = groups[runner.event_id] || [];
        group.push(runner);
        groups[runner.event_id] = group;
        return groups;
      }, {});
    this.runnersGroupedByEventArray = Object.keys(runnersGroupedByEvent).map(
      (key: string) => {
        return runnersGroupedByEvent[Number(key)];
      }
    );
  }

  onCancelClick(): void {
    this.dialogRef.close(null);
  }

  onLoadRunnersClick(): void {
    const runnersToPrint = [...this.runnersGroupedByEventArray].flatMap((r) => {
      return r
        .filter((t: any) => t.selected)
        .map((t: any) => {
          delete t.selected;
          return t;
        });
    });
    this.dialogRef.close(runnersToPrint);
  }

  partiallySelected(groupOfRunners: any) {
    const runnersSelected = groupOfRunners.filter((r: any) => r.selected);
    return (
      runnersSelected.length > 0 &&
      runnersSelected.length != groupOfRunners.length &&
      groupOfRunners.length > 0
    );
  }

  allSelected(groupOfRunners: any) {
    const runnersSelected = groupOfRunners.filter((r: any) => r.selected);
    return (
      runnersSelected.length === groupOfRunners.length &&
      groupOfRunners.length > 0
    );
  }
  updateSelectedRunners(checked: boolean, groupOfRunners: any) {
    if (checked) {
      groupOfRunners = groupOfRunners.map((r: any) => {
        r.selected = true;
        return r;
      });
    } else {
      groupOfRunners = groupOfRunners.map((r: any) => {
        r.selected = false;
        return r;
      });
    }
  }

  hasRunnersSelected(): boolean {
    return (
      [...this.runnersGroupedByEventArray].flatMap((r) => {
        return r.filter((t: any) => t.selected);
      }).length > 0
    );
  }

  getNumberOfEventSelectedRunners(groupOfRunners: any[]) {
    return groupOfRunners.filter((r: any) => r.selected).length;
  }
  getNumberOfTotalSelectedRunners() {
    return [...this.runnersGroupedByEventArray].flatMap((r) => {
      return r.filter((t: any) => t.selected);
    }).length;
  }
  getNumberOfTotalRunners() {
    return [...this.runnersGroupedByEventArray].flatMap((r) => {
      return r;
    }).length;
  }

}
