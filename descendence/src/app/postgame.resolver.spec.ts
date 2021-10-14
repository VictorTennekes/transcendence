import { TestBed } from '@angular/core/testing';

import { PostgameResolver } from './postgame.resolver';

describe('PostgameResolver', () => {
  let resolver: PostgameResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(PostgameResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
