import { TestBed } from '@angular/core/testing';

import { FriendResolver } from './friend.resolver';

describe('FriendResolver', () => {
  let resolver: FriendResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(FriendResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
