import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HowAComponent } from './how-a.component';

describe('HowAComponent', () => {
  let component: HowAComponent;
  let fixture: ComponentFixture<HowAComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HowAComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HowAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
