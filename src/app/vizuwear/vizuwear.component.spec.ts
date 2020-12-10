import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VizuwearComponent } from './vizuwear.component';

describe('VizuwearComponent', () => {
  let component: VizuwearComponent;
  let fixture: ComponentFixture<VizuwearComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VizuwearComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VizuwearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
