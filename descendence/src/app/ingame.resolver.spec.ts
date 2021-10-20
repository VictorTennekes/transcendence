import { TestBed } from '@angular/core/testing';

import { IngameResolver } from './ingame.resolver';

describe('IngameResolver', () => {
  let resolver: IngameResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(IngameResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
