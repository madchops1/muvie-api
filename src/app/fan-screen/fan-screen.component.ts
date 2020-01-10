//<reference path="./image-capture.d.ts" />

import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { SocketService } from '../socket.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import "p5/lib/addons/p5.sound";
import "p5/lib/addons/p5.dom";
import { promise } from 'protractor';

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
    timeArray: any = [200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000];
    gotCapabilities: any = false;
    stream: any = false;
    takingPic: any = false;
    timer: any = 'Get Ready';
    canvas: any;
    context: any;
    cameraPerm: any = false;

    @ViewChild('videoElement') videoElement: any;
    video: any;

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
        this.video = this.videoElement.nativeElement;
        this.canvas = document.getElementById('canvas');

        // Connect to ws
        this.socketService.connect(this.mid);

        // ws ping/pong
        this._ping = this.socketService.ping.subscribe(() => {
            this.socketService.pong();
        });

        // Get crowdscreen data from ws
        this._getCrowdScreen = this.socketService.getCrowdScreen.subscribe(data => {
            console.log('receiving getCrowdScreen', data);

            if (!this.takingPic) {

                if (data.function) {
                    this.crowdScreenBackgroundColor = data.backgroundColor;
                    this.crowdScreenFunction = data.function;
                    this.crowdScreenIntensity = data.intensity;
                    this.torch = data.torch;
                }

                this.applyConstraints();

                clearInterval(this.interval);
                let intervalTime = this.timeArray[Math.floor(Math.random() * this.timeArray.length)];

                // Multi-color, change to a random color at a random interval between 500-2000ms
                if (this.crowdScreenFunction == 'playCrowdScreenMultiColorModule') {
                    // Multi-Color loop
                    this.interval = setInterval(() => {
                        console.log('Multi-Color Loop');
                        this.crowdScreenBackgroundColor = this.generateHexColor();
                    }, 200);
                }
                // Sparkle, change to a random intensity at a random interval between 200-2000ms
                else if (this.crowdScreenFunction == 'playCrowdScreenSparkleModule') {
                    // Sparkle loop
                    this.interval = setInterval(() => {
                        console.log('Sparkle Loop');
                        this.torch = !this.torch;
                        this.crowdScreenIntensity = Math.random();
                        this.applyConstraints();
                    }, intervalTime);
                }
                //this.setCamera('environment');
            }
        });
        this.refreshCrowdScreen();
    }

    setCamera(facingMode): any {
        //return new promise();
        if (SUPPORTS_MEDIA_DEVICES) {
            //Get the environment camera (usually the second one)
            navigator.mediaDevices.enumerateDevices().then(devices => {

                const cameras = devices.filter((device) => device.kind === 'videoinput');
                console.log('cameras', cameras);
                if (cameras.length === 0) {
                    this.msg = 'No camera found on this device.';
                    this.cameraPerm = false;
                } else {
                    const camera = cameras[cameras.length - 1];
                    this.cameraPerm = true;

                    // Create stream and get video track
                    navigator.mediaDevices.getUserMedia({
                        video: {
                            //deviceId: camera.deviceId,
                            //facingMode: ['user', 'environment'],
                            facingMode: { exact: facingMode },
                            height: { ideal: 1080 },
                            width: { ideal: 1920 }
                        },
                        audio: false
                    }).then(stream => {
                        this.track = stream.getVideoTracks()[0];

                        //Create image capture object and get camera capabilities
                        const imageCapture = new ImageCapture(this.track);
                        const photoCapabilities = imageCapture.getPhotoCapabilities().then(() => {

                            this.gotCapabilities = true;
                            this.stream = stream;
                            //this.video.srcObject = stream;// = window.URL.createObjectURL(stream);
                            //this.video.play();
                            this.applyConstraints();

                        });
                    });
                }
            });
        }
    }

    refreshCrowdScreen(): any {
        this.socketService.refreshCrowdScreen();
    }

    randomInt(min, max): any {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    generateHexColor(): any {
        return "#" + Math.random().toString(16).slice(2, 8);
    }

    applyConstraints(): any {
        if (this.gotCapabilities) {
            try {
                this.track.applyConstraints({
                    advanced: [<any>{ torch: this.torch, intensity: this.intensity }]
                }).then(() => {
                    console.log('constraints applied')
                }, (err) => {
                    console.log('could not apply constraints beta')
                });
            } catch {
                console.log('could not apply constraints alpha');
            }
        }
    }

    takePic(e): any {

        console.log('takePic');
        this.takingPic = true;
        this.torch = false;
        this.setCamera('user');

        setTimeout(() => {
            this.video.srcObject = this.stream;// = window.URL.createObjectURL(stream);
            //this.video.context
            this.video.onloadeddata = () => {
                //console.log('Video data loaded');
                //console.log(this.video.videoWidth, this.video.videoHeight);
                //console.log(this.video.width, this.video.height);    
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                this.context = this.canvas.getContext('2d');
                //this.context.translate(this.video.videoWidth, 0);
                //this.context.scale(-1, 1);
            };

            this.video.play();

            //this.canvas.width = this.video.width();
            //this.canvas.height = this.video.height();
            //console.log(this.video.videoWidth, this.video.videoHeight);
            //this.context = this.canvas.getContext('2d');

            this.timer = '3';
            setTimeout(() => {
                this.timer = '2';
                setTimeout(() => {
                    this.timer = '1';
                    setTimeout(() => {

                        this.timer = '';
                        this.context.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);
                        let dataUri = this.canvas.toDataURL('image/jpeg'); // can also use 'image/png'
                        this.socketService.sendCrowdScreenImage(dataUri);

                        setTimeout(() => {

                            this.takingPic = false;
                            //this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
                            //this.getSignedRequest(dataURI, 'image');
                            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
                            this.video.src = '';
                            this.timer = 'Get Ready';
                            this.setCamera('environment');

                        }, 3000);
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 2000);
    }

    getSignedRequest(file, type): any {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `/api/sign-s3?file-name=${file.name}&file-type=${file.type}`);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    this.uploadFile(file, response.signedRequest, response.url, type);
                }
                else {
                    alert('Could not get signed URL.');
                }
            }
        };
        xhr.send();
    }

    uploadFile(file, signedRequest, url, type): any {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signedRequest);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {

                    //let response = JSON.parse(xhr.responseText);
                    console.log('Uploaded.', xhr.responseURL);
                    let s = xhr.responseURL
                    s = s.substring(0, s.indexOf('?'));

                }
                else {
                    alert('Could not upload file.');
                }
            }
        };
        xhr.send(file);
    }
}
