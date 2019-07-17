import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanCamComponent } from './fan-cam.component';

describe('FanCamComponent', () => {
  let component: FanCamComponent;
  let fixture: ComponentFixture<FanCamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanCamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanCamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
