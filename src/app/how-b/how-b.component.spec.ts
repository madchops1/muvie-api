import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HowBComponent } from './how-b.component';

describe('HowBComponent', () => {
  let component: HowBComponent;
  let fixture: ComponentFixture<HowBComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HowBComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HowBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
