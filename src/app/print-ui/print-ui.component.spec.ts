import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintUiComponent } from './print-ui.component';

describe('PrintUiComponent', () => {
  let component: PrintUiComponent;
  let fixture: ComponentFixture<PrintUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintUiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
