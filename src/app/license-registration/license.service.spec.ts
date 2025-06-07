/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { LicenseService } from './license.service';

describe('Service: Crypto', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LicenseService]
    });
  });

  it('should ...', inject([LicenseService], (service: LicenseService) => {
    expect(service).toBeTruthy();
  }));
});
