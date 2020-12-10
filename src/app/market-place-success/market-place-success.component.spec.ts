import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketPlaceSuccessComponent } from './market-place-success.component';

describe('MarketPlaceSuccessComponent', () => {
  let component: MarketPlaceSuccessComponent;
  let fixture: ComponentFixture<MarketPlaceSuccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketPlaceSuccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketPlaceSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
