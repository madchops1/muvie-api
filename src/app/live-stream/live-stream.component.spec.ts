import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveStreamComponent } from './live-stream.component';

describe('LiveStreamComponent', () => {
  let component: LiveStreamComponent;
  let fixture: ComponentFixture<LiveStreamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveStreamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
