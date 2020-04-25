import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HowCComponent } from './how-c.component';

describe('HowCComponent', () => {
  let component: HowCComponent;
  let fixture: ComponentFixture<HowCComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HowCComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HowCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
