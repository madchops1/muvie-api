import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanScreenComponent } from './fan-screen.component';

describe('FanScreenComponent', () => {
  let component: FanScreenComponent;
  let fixture: ComponentFixture<FanScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanScreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
