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
        console.log('DOWNLOAD WINDOWS CLICKED');
        //https://kzp2cqupt6.execute-api.us-east-2.amazonaws.com/default/visualzEventEmail
        //this.$gaService.event('download_windows', 'download_page', 'Download Windows');

        //return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        //this.mid = mid;
        let params = 'email=karl.steltenpohl@gmail.com';
        xhr.open('POST', 'https://kzp2cqupt6.execute-api.us-east-2.amazonaws.com/default/visualzEventEmail', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = xhr.responseText;
                    //resolve(response);
                    console.log('EMAIL EVENT RESPONSE: ', response);
                }
                else {
                    console.log('Error');
                    //reject('err');
                }
            }
        };
        xhr.send(params);
        //});

    }

}
