import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-stream-start',
    templateUrl: './stream-start.component.html',
    styleUrls: ['./stream-start.component.scss']
})
export class StreamStartComponent implements OnInit {

    code: any = '';

    constructor() { }

    ngOnInit() {

    }

    start() {
        console.log('Start');
    }

    join() {
        console.log('Join');
    }

}
