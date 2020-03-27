import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamStartComponent } from './stream-start.component';

describe('StreamStartComponent', () => {
  let component: StreamStartComponent;
  let fixture: ComponentFixture<StreamStartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StreamStartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
