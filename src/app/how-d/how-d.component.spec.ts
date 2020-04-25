import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HowDComponent } from './how-d.component';

describe('HowDComponent', () => {
  let component: HowDComponent;
  let fixture: ComponentFixture<HowDComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HowDComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HowDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
