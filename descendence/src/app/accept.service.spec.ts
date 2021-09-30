import { TestBed } from '@angular/core/testing';

import { AcceptService } from './accept.service';

describe('AcceptService', () => {
  let service: AcceptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AcceptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
