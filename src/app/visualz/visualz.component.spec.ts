import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualzComponent } from './visualz.component';

describe('VisualzComponent', () => {
  let component: VisualzComponent;
  let fixture: ComponentFixture<VisualzComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualzComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualzComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
