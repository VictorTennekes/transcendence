import { TestBed } from '@angular/core/testing';

import { PostGameGuard } from './post-game.guard';

describe('PostGameGuard', () => {
  let guard: PostGameGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PostGameGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
