import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunnerGroupDialogComponent } from './runner-group-dialog.component';

describe('RunnerGroupDialogComponent', () => {
  let component: RunnerGroupDialogComponent;
  let fixture: ComponentFixture<RunnerGroupDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunnerGroupDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunnerGroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
