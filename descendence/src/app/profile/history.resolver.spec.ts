import { TestBed } from '@angular/core/testing';

import { HistoryResolver } from './history.resolver';

describe('HistoryResolver', () => {
  let resolver: HistoryResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(HistoryResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
