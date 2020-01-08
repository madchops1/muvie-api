import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Mp4ConverterComponent } from './mp4-converter.component';

describe('Mp4ConverterComponent', () => {
  let component: Mp4ConverterComponent;
  let fixture: ComponentFixture<Mp4ConverterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Mp4ConverterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Mp4ConverterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
