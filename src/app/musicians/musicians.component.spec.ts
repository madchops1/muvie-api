import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MusiciansComponent } from './musicians.component';

describe('MusiciansComponent', () => {
  let component: MusiciansComponent;
  let fixture: ComponentFixture<MusiciansComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MusiciansComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MusiciansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
