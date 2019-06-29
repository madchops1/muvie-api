import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-download',
    templateUrl: './download.component.html',
    styleUrls: ['./download.component.scss']
})
export class DownloadComponent implements OnInit {

    //version: any = '1.0.1';

    constructor() { }

    ngOnInit() {
    }

    isMacintosh(): any {
        return navigator.platform.indexOf('Mac') > -1
    }

    isWindows(): any {
        return navigator.platform.indexOf('Win') > -1
    }

    downloadWindows(): any {
        //this.$gaService.event('download_windows', 'download_page', 'Download Windows');

    }

}
