import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { SocketService } from '../socket.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import * as p5 from 'p5';
import "p5/lib/addons/p5.sound";
import "p5/lib/addons/p5.dom";

const SUPPORTS_MEDIA_DEVICES = 'mediaDevices' in navigator;

@Component({
    selector: 'app-fan-screen',
    templateUrl: './fan-screen.component.html',
    styleUrls: ['./fan-screen.component.scss']
})
export class FanScreenComponent implements OnInit {

    mid: any = '';
    torch: any = false;
    crowdScreenBackgroundColor: any = 'transparent';
    
    currentRoute: any = '';
    private _getCrowdScreen: Subscription;

    

    constructor(private route: ActivatedRoute, private router: Router, private socketService: SocketService) { 
        router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.currentRoute = val.url;
                let routeArray = this.currentRoute.split("/");
                this.mid = routeArray[routeArray.length - 1];
                console.log('mid', this.mid);
            }
        });
    }

    ngOnInit() {
        this.socketService.connect(this.mid);

        this._getCrowdScreen = this.socketService.getCrowdScreen.subscribe(data => {
            //if (JSON.stringify(data) === JSON.stringify(this.lastData)) {
                ///
            //} else {
                console.log('receiving getCrowdScreen', data);
                this.crowdScreenBackgroundColor = data.backgroundColor;
            //}
            //setTimeout(() => {
            //    this.drawCanvas();
            //}, 1000);
        });

        this.refreshCrowdScreen();

        if (SUPPORTS_MEDIA_DEVICES) {
            //Get the environment camera (usually the second one)
            navigator.mediaDevices.enumerateDevices().then(devices => {
                console.log('devices',devices);

                const cameras = devices.filter((device) => device.kind === 'videoinput');

                if (cameras.length === 0) {
                    console.log('No camera found on this device.');
                }
                
                const camera = cameras[cameras.length - 1];
                console.log(camera);


            }); 
        }
        
    }

    refreshCrowdScreen(): any {
        this.socketService.refreshCrowdScreen();
    }

}
