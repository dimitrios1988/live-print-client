import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { EventOptionsDialogComponent } from './event-options-dialog.component';

describe('EventOptionsDialogComponent', () => {
  let component: EventOptionsDialogComponent;
  let fixture: ComponentFixture<EventOptionsDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [EventOptionsDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { name: 'Test', enabled: false } },
        { provide: MatDialogRef, useValue: { close: () => {} } },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
