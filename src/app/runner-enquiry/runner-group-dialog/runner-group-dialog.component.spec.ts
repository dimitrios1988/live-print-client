import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { RunnerGroupDialogComponent } from './runner-group-dialog.component';
import { IRunner } from '../interfaces/runner.interface';

describe('RunnerGroupDialogComponent', () => {
  let component: RunnerGroupDialogComponent;
  let fixture: ComponentFixture<RunnerGroupDialogComponent>;

  const data = [
    {
      id: 1,
      bib: 101,
      first_name: 'Test',
      last_name: 'Runner',
      event_id: 1,
      event_name: 'Test Event',
      group_name: 'Test Group',
      is_printed: false,
    } as unknown as IRunner,
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunnerGroupDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: () => {} } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RunnerGroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
