import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

import { RunnerGroupDialogComponent } from './runner-group-dialog.component';
import { IRunner } from '../interfaces/runner.interface';

describe('RunnerGroupDialogComponent', () => {
  let component: RunnerGroupDialogComponent;
  let fixture: ComponentFixture<RunnerGroupDialogComponent>;
  let dialogRef: { close: jasmine.Spy; afterOpened: () => unknown };

  const runner = (
    id: number,
    bib: number,
    event_id: number,
    is_printed: boolean,
  ) =>
    ({
      id,
      bib,
      event_id,
      is_printed,
      first_name: 'Test',
      last_name: 'Runner',
      event_name: `Event ${event_id}`,
      group_name: 'Test Group',
    }) as unknown as IRunner;

  async function setup(data: IRunner[]): Promise<void> {
    dialogRef = { close: jasmine.createSpy('close'), afterOpened: () => of() };

    await TestBed.configureTestingModule({
      imports: [RunnerGroupDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RunnerGroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('with runners across two events', () => {
    // Deliberately unsorted so the component's own sorting is exercised.
    const data = [
      runner(1, 300, 2, false),
      runner(2, 101, 1, true),
      runner(3, 205, 1, false),
      runner(4, 150, 1, false),
    ];

    beforeEach(async () => {
      await setup(data);
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should not mutate the injected dialog data', () => {
      expect(data.map((r) => r.id)).toEqual([1, 2, 3, 4]);
    });

    it('should group runners by event and sort each group by bib', () => {
      expect(component.groups.length).toBe(2);
      expect(component.groups[0].eventId).toBe(1);
      expect(component.groups[0].rows.map((row) => row.runner.bib)).toEqual([
        101, 150, 205,
      ]);
      expect(component.groups[1].rows.map((row) => row.runner.bib)).toEqual([
        300,
      ]);
    });

    it('should preselect every runner that has not been printed', () => {
      expect(component.groups[0].selectedCount()).toBe(2);
      expect(component.groups[0].allSelected()).toBeFalse();
      expect(component.groups[0].partiallySelected()).toBeTrue();
      expect(component.totalSelected()).toBe(3);
      expect(component.totalRunners).toBe(4);
      expect(component.hasSelection()).toBeTrue();
    });

    it('should select and deselect a whole event group', () => {
      const group = component.groups[0];

      component.toggleGroup(group, true);
      expect(group.selectedCount()).toBe(3);
      expect(group.allSelected()).toBeTrue();
      expect(group.partiallySelected()).toBeFalse();

      component.toggleGroup(group, false);
      expect(group.selectedCount()).toBe(0);
      expect(group.allSelected()).toBeFalse();
      expect(group.partiallySelected()).toBeFalse();
      expect(component.totalSelected()).toBe(1);
    });

    it('should close with the selected runners sorted by bib', () => {
      component.onLoadRunnersClick();

      const closedWith = dialogRef.close.calls.mostRecent().args[0] as IRunner[];
      expect(closedWith.map((r) => r.bib)).toEqual([150, 205, 300]);
      expect(closedWith.every((r) => !('selected' in r))).toBeTrue();
    });

    it('should close with null on cancel', () => {
      component.onCancelClick();
      expect(dialogRef.close).toHaveBeenCalledWith(null);
    });

    it('should keep the total outside the scrolling content', () => {
      // In <mat-dialog-content> it scrolled out of view on long groups.
      expect(
        fixture.nativeElement.querySelector('mat-dialog-actions .group-total'),
      ).toBeTruthy();
      expect(
        fixture.nativeElement.querySelector('mat-dialog-content .group-total'),
      ).toBeNull();
    });

    it('should keep the displayed total in step with the selection', () => {
      const total = () =>
        fixture.nativeElement
          .querySelector('.group-total')
          .textContent.replace(/\s+/g, ' ')
          .trim();

      expect(total()).toBe('Σύνολο Επιλεγμένων Δρομέων 3/4');

      component.toggleGroup(component.groups[0], false);
      fixture.detectChanges();
      expect(total()).toBe('Σύνολο Επιλεγμένων Δρομέων 1/4');
    });

    it('should size a short event viewport to its content', () => {
      // Single runner in event 2 -> one row tall, not a half-empty fixed box.
      expect(component.groups[1].viewportHeight).toBe(component.rowHeight);
    });
  });

  describe('with a large event', () => {
    const data = Array.from({ length: 500 }, (_, i) =>
      runner(i + 1, i + 1, 1, false),
    );

    beforeEach(async () => {
      await setup(data);
      await fixture.whenStable();
      fixture.detectChanges();
    });

    it('should only render the visible slice of rows', () => {
      const renderedRows = fixture.nativeElement.querySelectorAll(
        'cdk-virtual-scroll-viewport .table-row',
      );
      // 450px viewport / 48px rows plus the CDK buffer -> ~14, never all 500.
      expect(renderedRows.length).toBeGreaterThan(0);
      expect(renderedRows.length).toBeLessThan(30);
    });

    it('should report a real total content size to the viewport', () => {
      // The previous mat-table markup left this at 0, which is what produced
      // the scroll flicker.
      const spacer = fixture.nativeElement.querySelector(
        '.cdk-virtual-scroll-spacer',
      ) as HTMLElement;
      expect(spacer.getBoundingClientRect().height).toBeGreaterThan(
        data.length * component.rowHeight - 1,
      );
    });
  });
});
