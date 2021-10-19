import { TestBed } from '@angular/core/testing';

import { OnlineResolver } from './online.resolver';

describe('OnlineResolver', () => {
  let resolver: OnlineResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(OnlineResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
