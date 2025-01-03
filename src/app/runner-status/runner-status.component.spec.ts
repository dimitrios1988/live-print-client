import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunnerStatusComponent } from './runner-status.component';

describe('RunnerStatusComponent', () => {
  let component: RunnerStatusComponent;
  let fixture: ComponentFixture<RunnerStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunnerStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunnerStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
