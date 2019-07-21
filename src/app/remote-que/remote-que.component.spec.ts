import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteQueComponent } from './remote-que.component';

describe('RemoteQueComponent', () => {
  let component: RemoteQueComponent;
  let fixture: ComponentFixture<RemoteQueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoteQueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoteQueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
