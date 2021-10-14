import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadcircleComponent } from './loadcircle.component';

describe('LoadcircleComponent', () => {
  let component: LoadcircleComponent;
  let fixture: ComponentFixture<LoadcircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadcircleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadcircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
