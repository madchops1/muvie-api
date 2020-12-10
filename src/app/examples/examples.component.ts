import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-examples',
    templateUrl: './examples.component.html',
    styleUrls: ['./examples.component.scss']
})
export class ExamplesComponent implements OnInit {

    examples: any = [
        {
            name: ''
        }
    ];

    constructor() { }

    ngOnInit() {
    }

}
