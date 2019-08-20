import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LaserzComponent } from './laserz.component';

describe('LaserzComponent', () => {
  let component: LaserzComponent;
  let fixture: ComponentFixture<LaserzComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LaserzComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LaserzComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
