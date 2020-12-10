import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MarketplaceDialogAddComponent } from '../marketplace-dialog-add/marketplace-dialog-add.component';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

    subscriptions: any = false;
    newsletter: any = {
        email_address: false
    };
    email: any;
    catalog: any = [];
    library: any = [];

    constructor(public auth: AuthService, private dialog: MatDialog) { }

    ngOnInit() {

        console.log('ngOnInit', this.auth);
        //let userString = JSON.parse(this.auth.userProfile$);
        //console.log('userString', userString);
        this.auth.userProfile$.subscribe((profile) => {
            this.email = profile.email;
        });

        this.getSubscriptions().then((res) => {
            let data = JSON.parse(res);
            this.subscriptions = data[0].data;
            console.log('SUBSCRIPTIONS', res, this.subscriptions);
        });

        this.getNewsletter().then((res) => {
            let data = JSON.parse(res);
            this.newsletter = data;
            //console.log('NEWSLETTER', this.newsletter);
        });

        // this.getCatalog().then((res) => {
        //     let data = JSON.parse(res);
        //     this.catalog = data;
        //     //console.log('CATALOG', this.catalog);
        // });

        // this.getLibrary().then((res) => {
        //     let data = JSON.parse(res);
        //     this.library = data;
        //     //console.log('LIBRARY', this.library);
        // });

    }

    openCustomerPortal(customer): any {
        this.getCustomerPortalRedirect(customer).then((res) => {
            let response = JSON.parse(res);
            console.log('RESPONSE', response);
            window.location.href = response.url.url;
        });
    }

    getCustomerPortalRedirect(customer): any {
        return new Promise(async (resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let params = 'customer=' + customer;
            xhr.open('POST', environment.ioUrl + '/api/stripe/customerportal', true);
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
            xhr.send(params);
        });
    }

    getNewsletter(): any {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let params = 'email=' + this.email;
            xhr.open('POST', environment.ioUrl + '/api/getNewsletter', true);
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
            xhr.send(params);
        });
    }

    getSubscriptions(): any {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let params = 'email=' + this.email;
            xhr.open('POST', environment.ioUrl + '/api/getSubscriptions', true);
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
            xhr.send(params);
        });
    }

    getCatalog(): any {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let params = 'email=' + this.email;
            xhr.open('POST', environment.ioUrl + '/api/getCatalog', true);
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
            xhr.send(params);
        });
    }

    getLibrary(): any {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let params = 'email=' + this.email;
            xhr.open('POST', environment.ioUrl + '/api/getLibrary', true);
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
            xhr.send(params);
        });
    }

    openEditPackDialog(id): any {

        const dialogRef = this.dialog.open(MarketplaceDialogAddComponent, {
            width: '600px',
            data: {
                id: id
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed', result);
        });
    }

}
