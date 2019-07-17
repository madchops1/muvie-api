import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteCamComponent } from './remote-cam.component';

describe('RemoteCamComponent', () => {
  let component: RemoteCamComponent;
  let fixture: ComponentFixture<RemoteCamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoteCamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoteCamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
