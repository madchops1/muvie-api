import { Component, OnInit } from '@angular/core';
import * as uuid from 'uuid/v4';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-stream-start',
    templateUrl: './stream-start.component.html',
    styleUrls: ['./stream-start.component.scss']
})
export class StreamStartComponent implements OnInit {

    public environment: any = environment;
    code: any = '';
    rooms: any = [];

    constructor(private router: Router, private httpClient: HttpClient) {

    }

    ngOnInit() {

        // get rooms
        this.getRooms();

    }


    getRooms(): any {
        return new Promise((resolve, reject) => {
            this.httpClient.get(this.environment.ioUrl + '/api/livestream/getrooms').subscribe((res: any) => {
                console.log('res', res);
                if (res) {
                    this.rooms = res.rooms;
                    resolve(res);
                } else {
                    console.log('no response')
                    //this.errorTryAgain();
                    reject();
                }
            }, (err) => {
                console.log('err', err);
                reject();
                //this.errorTryAgain();
            });
        });
    }

    start() {
        console.log('Start');
        if (this.code == '') {
            // gen code
            this.code = uuid();
        } else {
            this.code = this.code.replace(/ /g, '-').toLowerCase();
        }

        // go to url   
        this.goToUrl();
    }

    // join() {
    //     console.log('Join');

    //     if (this.code == '') {
    //         alert('Please enter a nickname or code of the live stream you want to join.');
    //         return false;
    //     }

    //     // go to url
    //     this.goToUrl();
    // }

    goToUrl() {
        this.router.navigateByUrl('/live/' + this.code);

    }

}
