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
    hasBackdrop: any = { value: false };
    query: any = '';
    results: any = [];

    constructor(private dialog: MatDialog) {

    }

    ngOnInit() {
        this.search();
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

    searchApiRequest(): any {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            //let params = 'pack=' + JSON.stringify(this.pack);
            xhr.open('GET', 'api/search?query=' + this.query, true);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const response = xhr.responseText;
                        console.log('CHARLIE', response);
                        resolve(response);
                    }
                    else {
                        console.log('Error');
                        reject('err');
                    }
                }
            };
            xhr.send();
        });
    }

    search(): void {
        this.searchApiRequest().then((res) => {
            console.log('res', res);
        }, (err) => {
            console.log('err', err);
        });
    }

}
