import { TestBed } from '@angular/core/testing';

import { RunnerPrinterService } from './runner-printer.service';

describe('RunnerPrinterService', () => {
  let service: RunnerPrinterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RunnerPrinterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
