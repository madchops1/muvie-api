import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HtwComponent } from './htw.component';

describe('HtwComponent', () => {
  let component: HtwComponent;
  let fixture: ComponentFixture<HtwComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HtwComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HtwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
