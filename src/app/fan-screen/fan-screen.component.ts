/// <reference path="./image-capture.d.ts" />

import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { SocketService } from '../socket.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
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
    intensity: any = 1;
    crowdScreenBackgroundColor: any = 'transparent';
    crowdScreenFunction: any = '';
    crowdScreenIntensity: any = 1;
    interval: any = false;
    currentRoute: any = '';
    camera: any = false;
    track: any = false;
    msg: any = "";
    timeArray: any = [ 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000];

    private _getCrowdScreen: Subscription;
    private _ping: Subscription;

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
        
        // Connect to ws
        this.socketService.connect(this.mid);

        // ws ping/pong
        this._ping = this.socketService.ping.subscribe(() => {
            this.socketService.pong();
        });

        // Get crowdscreen data from ws
        this._getCrowdScreen = this.socketService.getCrowdScreen.subscribe(data => {
            console.log('receiving getCrowdScreen', data);
            this.crowdScreenBackgroundColor = data.backgroundColor;
            this.crowdScreenFunction = data.function;
            this.crowdScreenIntensity = data.intensity;
            this.torch = data.torch;
            
            this.applyConstraints();

            clearInterval(this.interval);
            let intervalTime = this.timeArray[Math.floor(Math.random()*this.timeArray.length)];

            // Multi-color, change to a random color at a random interval between 500-2000ms
            if(this.crowdScreenFunction == 'playCrowdScreenMultiColorModule') {

                // Multi-Color loop
                this.interval = setInterval(() => {
                    console.log('Multi-Color Loop');
                    this.crowdScreenBackgroundColor = this.generateHexColor();
                }, intervalTime);
            } 
            // Sparkle, change to a random intensity at a random interval between 200-2000ms
            else if(this.crowdScreenFunction == 'playCrowdScreenSparkleModule') {

                // Sparkle loop
                this.interval = setInterval(() => {
                    console.log('Sparkle Loop');
                    this.torch = !this.torch;
                    this.crowdScreenIntensity = Math.random();
                    this.applyConstraints();
                }, intervalTime);
            } 
            
        });

        if (SUPPORTS_MEDIA_DEVICES) {
            //Get the environment camera (usually the second one)
            navigator.mediaDevices.enumerateDevices().then(devices => {
            
              const cameras = devices.filter((device) => device.kind === 'videoinput');
          
              if (cameras.length === 0) {
                this.msg='No camera found on this device.';
              }
              const camera = cameras[cameras.length - 1];
          
              // Create stream and get video track
              navigator.mediaDevices.getUserMedia({
                video: {
                  deviceId: camera.deviceId,
                  facingMode: ['user', 'environment'],
                  height: {ideal: 1080},
                  width: {ideal: 1920}
                }
              }).then(stream => {
                this.track = stream.getVideoTracks()[0];
        
                //Create image capture object and get camera capabilities
                const imageCapture = new ImageCapture(this.track)
                const photoCapabilities = imageCapture.getPhotoCapabilities().then(() => {
          
                    //this.track.applyConstraints({
                    //        advanced: [<any>{torch: true}]
                    //});
                  //  track.applyConstraints({ advanced})
                  //todo: check if camera has a torch
          
                  //let there be light!
                  //const btn = document.querySelector('.switch');
                  //btn.addEventListener('click', function(){
                    
                  //});
                });
              });
            });
            //The light will be on as long the track exists
        }
        this.refreshCrowdScreen();
    }

    refreshCrowdScreen(): any {
        this.socketService.refreshCrowdScreen();
    }
    
    randomInt(min, max): any {
        return Math.floor(Math.random()*(max-min+1)+min);
    }

    generateHexColor(): any {
        return "#" + Math.random().toString(16).slice(2, 8);
    }

    applyConstraints(): any {
        try {
            this.track.applyConstraints({
                advanced: [<any>{torch: this.torch, intensity: this.intensity }]
            }).then(() => {
                console.log('constraints applied')
            },(err) => {
                console.log('could not apply constraints beta')
            });
        } catch {
            console.log('could not apply constraints alpha');
        }   
    }
}
