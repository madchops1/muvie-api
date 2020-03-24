import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteScreenComponent } from './remote-screen.component';

describe('RemoteScreenComponent', () => {
  let component: RemoteScreenComponent;
  let fixture: ComponentFixture<RemoteScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoteScreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoteScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
