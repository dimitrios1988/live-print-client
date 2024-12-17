/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { UserOptionsService } from './user-options.service';

describe('Service: UserOptions', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserOptionsService]
    });
  });

  it('should ...', inject([UserOptionsService], (service: UserOptionsService) => {
    expect(service).toBeTruthy();
  }));
});
