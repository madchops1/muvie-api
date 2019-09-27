import { Component, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-visualz',
  templateUrl: './visualz.component.html',
  styleUrls: ['./visualz.component.scss']
})
export class VisualzComponent implements OnInit {

    deviceInfo: any;

    constructor(private deviceService: DeviceDetectorService) { 

    }

    ngOnInit() {
        this.deviceInfo = this.deviceService.getDeviceInfo();
        console.log('deviceInfo', this.deviceInfo);
    }


    downloadMac(): any {
      console.log('DOWNLOAD MAC CLICKED');
      //https://kzp2cqupt6.execute-api.us-east-2.amazonaws.com/default/visualzEventEmail
      //this.$gaService.event('download_windows', 'download_page', 'Download Windows');

      //return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      //this.mid = mid;
      let params = 'msg=VISUALZ download for Mac from www.visualzstudio.com';
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

  
  downloadWindows(): any {
      console.log('DOWNLOAD WINDOWS CLICKED');
      //https://kzp2cqupt6.execute-api.us-east-2.amazonaws.com/default/visualzEventEmail
      //this.$gaService.event('download_windows', 'download_page', 'Download Windows');

      //return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      //this.mid = mid;
      let params = 'msg=VISUALZ download for Windows from www.visualzstudio.com';
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
