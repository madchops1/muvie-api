import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

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

    constructor(public auth: AuthService) { }

    ngOnInit() {

        console.log('ngOnInit', this.auth);
        //let userString = JSON.parse(this.auth.userProfile$);
        //console.log('userString', userString);
        this.auth.userProfile$.subscribe((profile) => {
            this.email = profile.email;
        });

        this.getSubscriptions().then((res) => {
            let data = JSON.parse(res);
            this.subscriptions = data.data;
            console.log('SUBSCRIPTIONS', res, this.subscriptions);
        });

        this.getNewsletter().then((res) => {
            let data = JSON.parse(res);
            this.newsletter = data;
            console.log('NEWSLETTER', this.newsletter);
        });

        this.getCatalog().then((res) => {
            let data = JSON.parse(res);
            this.catalog = data;
            console.log('CATALOG', this.catalog);
        });

        this.getLibrary().then((res) => {
            let data = JSON.parse(res);
            this.library = data;
            console.log('LIBRARY', this.library);
        });

    }

    getNewsletter(): any {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let params = 'email=' + this.email;
            xhr.open('POST', 'api/getNewsletter', true);
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
            xhr.open('POST', 'api/getSubscriptions', true);
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
            xhr.open('POST', 'api/getCatalog', true);
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
            xhr.open('POST', 'api/getLibrary', true);
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

}
