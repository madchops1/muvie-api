import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MarketplaceDialogAddComponent } from '../marketplace-dialog-add/marketplace-dialog-add.component';

@Component({
    selector: 'app-marketplace',
    templateUrl: './marketplace.component.html',
    styleUrls: ['./marketplace.component.scss']
})

export class MarketplaceComponent implements OnInit {

    mode: any = { value: 'side' };

    constructor(private dialog: MatDialog) {

    }

    ngOnInit() {
        this.getPacks();
        //this.mode.value = 'side';

    }

    getPacks(): any {
        console.log('getPacks()');

    }

    openAddDialog(): void {

        console.log('openAddDialog');

        const dialogRef = this.dialog.open(MarketplaceDialogAddComponent, {
            width: '600px',
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed', result);
        });
    }

}
