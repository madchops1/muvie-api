import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MarketplaceDialogAddComponent } from '../marketplace-dialog-add/marketplace-dialog-add.component';

@Component({
    selector: 'app-marketplace',
    templateUrl: './marketplace.component.html',
    styleUrls: ['./marketplace.component.scss']
})

export class MarketplaceComponent implements OnInit {

    pack: [];

    constructor(private dialog: MatDialog) {

    }

    ngOnInit() {
        this.getPacks();

    }

    getPacks(): any {
        console.log('getPacks()');

    }

    openAddDialog(): any {

    }

}
