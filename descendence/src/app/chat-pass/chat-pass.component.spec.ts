import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatPassComponent } from './chat-pass.component';

describe('ChatPassComponent', () => {
  let component: ChatPassComponent;
  let fixture: ComponentFixture<ChatPassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatPassComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatPassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
