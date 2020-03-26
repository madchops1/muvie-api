import { Component, OnInit } from '@angular/core';
import * as uuid from 'uuid/v4';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

@Component({
    selector: 'app-stream-start',
    templateUrl: './stream-start.component.html',
    styleUrls: ['./stream-start.component.scss']
})
export class StreamStartComponent implements OnInit {

    code: any = '';

    constructor(private router: Router) { }

    ngOnInit() {

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

    join() {
        console.log('Join');

        if (this.code == '') {
            alert('Please enter a nickname or code of the live stream you want to join.');
            return false;
        }

        // go to url
        this.goToUrl();
    }

    goToUrl() {
        this.router.navigateByUrl('/live/' + this.code);

    }

}
