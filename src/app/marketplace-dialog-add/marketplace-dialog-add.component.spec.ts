import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceDialogAddComponent } from './marketplace-dialog-add.component';

describe('MarketplaceDialogAddComponent', () => {
  let component: MarketplaceDialogAddComponent;
  let fixture: ComponentFixture<MarketplaceDialogAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketplaceDialogAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketplaceDialogAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
