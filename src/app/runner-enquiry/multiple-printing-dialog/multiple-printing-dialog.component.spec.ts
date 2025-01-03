import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplePrintingDialogComponent } from './multiple-printing-dialog.component';

describe('MultiplePrintingDialogComponent', () => {
  let component: MultiplePrintingDialogComponent;
  let fixture: ComponentFixture<MultiplePrintingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiplePrintingDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiplePrintingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
