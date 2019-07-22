/// <reference path="./image-capture.d.ts" />

import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { SocketService } from '../socket.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
//import { Flashlight } from '@ionic-native/flashlight';
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
        
        // Connect to ws
        this.socketService.connect(this.mid);

        // Get crowdscreen data from ws
        this._getCrowdScreen = this.socketService.getCrowdScreen.subscribe(data => {
            console.log('receiving getCrowdScreen', data);
            this.crowdScreenBackgroundColor = data.backgroundColor;
            this.crowdScreenFunction = data.function;
            this.crowdScreenIntensity = data.intensity;
            this.torch = data.torch;
            
            this.applyConstraints();

            clearInterval(this.interval);
            
            // Multi-color, change to a random color at a random interval between 500-2000ms
            if(this.crowdScreenFunction == 'playCrowdScreenMultiColorModule') {
                this.interval = setInterval(() => {
                    this.crowdScreenBackgroundColor = this.generateHexColor();
                }, this.randomInt(500,2000));
            } 
            // Sparkle, change to a random intensity at a random interval between 200-2000ms
            else if(this.crowdScreenFunction == 'playCrowdScreenSparkleModule') {
                this.interval = setInterval(() => {
                    this.torch = !this.torch;
                    this.crowdScreenIntensity = Math.random();
                    this.applyConstraints();
                }, this.randomInt(200,2000));
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
        
        this.track.applyConstraints({
            advanced: [<any>{torch: this.torch, intensity: this.intensity }]
        });
        
    }

}
