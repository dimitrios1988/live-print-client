import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunnerEnquiryComponent } from './runner-enquiry.component';

describe('RunnerEnquiryComponent', () => {
  let component: RunnerEnquiryComponent;
  let fixture: ComponentFixture<RunnerEnquiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunnerEnquiryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunnerEnquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
