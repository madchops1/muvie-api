//<reference path="./image-capture.d.ts" />
import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService } from '../services/socket.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import "p5/lib/addons/p5.sound";
import "p5/lib/addons/p5.dom";
import { UtilityService } from '../services/utility.service';
import { ProjectService } from '../services/project.service';
import Peer from 'peerjs';
const SUPPORTS_MEDIA_DEVICES = 'mediaDevices' in navigator;

@Component({
    selector: 'app-fan-screen',
    templateUrl: './fan-screen.component.html',
    styleUrls: ['./fan-screen.component.scss']
})
export class FanScreenComponent implements OnInit {

    environmentalVariables: any;

    mid: any = '';
    userAgent: any = '';
    canTakeImage: any = true; // start ture

    torch: any = false;
    intensity: any = 1;
    
    blackout: any = false;
    blackoutColor: any = '#000';
    crowdScreenBlackout: any = 'none';

    crowdScreenBackgroundColor: any = 'transparent';
    crowdScreenTorchDisplay = 'none';
    crowdScreenFunction: any = '';
    crowdScreenIntensity: any = 1;
    crowdScreenEnabled: any = false;

    interval: any = false;
    currentRoute: any = '';
    camera: any = false;
    track: any = false;
    msg: any = "";
    timeArray: any = [200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000];
    gotCapabilities: any = false;
    stream: any = false;

    takingPic: any = false;
    timer: any = '';
    canvas: any;
    context: any;
    cameraPerm: any = false;
    started = false;
    mobile = true;
    qr: any = '';

    peer: any = null;
    video2: any;
    remotePeerId: any;
    peerId: any = false;
    plan: any = 0;
    stream2: any = false;

    lastEnabled: any = false;

    facingMode: any = 'user'; // environment

    @ViewChild('videoElement') videoElement: any;
    video: any;

    private _getCrowdScreen: Subscription;
    private _ping: Subscription;
    private _reloadCrowdScreen: Subscription;
    private _remoteScreenRefresh: Subscription;

    constructor(private projectService: ProjectService, private utilityService: UtilityService, private route: ActivatedRoute, private router: Router, private socketService: SocketService) {

        // get the mid from the URL
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

        console.log('userAgent', navigator.userAgent);
        this.userAgent = navigator.userAgent;
        if (!navigator.userAgent.toLocaleLowerCase().includes('android') && !navigator.userAgent.toLowerCase().includes('iphone')) {
            this.mobile = false;
        }

        this.utilityService.generateQR('fancam', this.mid).then((res) => {
            console.log('QR', res);
            this.qr = res;
        });

        console.log('IS MOBILE:', this.mobile);

        // Video element and canvas element for photo taking and preview
        this.video = this.videoElement.nativeElement;
        this.canvas = document.getElementById('canvas');

        //let heartbeat: any = document.getElementById('heartbeat');
        //heartbeat.onloadeddata = () => {
        //    heartbeat.play();
        //};

        // Connect to ws
        this.socketService.connect(this.mid);

        // ws ping/pong
        this._ping = this.socketService.ping.subscribe(() => {
            this.socketService.pong();
        });

        this._reloadCrowdScreen = this.socketService.reloadCrowdScreen.subscribe(() => {
            window.location.reload();
        });

        // Get crowdscreen data from ws
        this._getCrowdScreen = this.socketService.getCrowdScreen.subscribe(data => {
            console.log('receiving getCrowdScreen', data);

            if (!this.takingPic) {

                if (data.enabled) {
                    this.crowdScreenBackgroundColor = data.backgroundColor;
                    this.crowdScreenFunction = data.function;
                    this.crowdScreenIntensity = data.intensity;
                    this.torch = data.torch;
                    this.crowdScreenEnabled = true;
                    this.camera = data.camera;
                    this.blackout = data.blackout;

                    if (this.crowdScreenBackgroundColor == '#ffffff') {
                        this.crowdScreenTorchDisplay = 'block';
                    } else {
                        this.crowdScreenTorchDisplay = 'none';
                    }

                    if (this.blackout) {
                        this.crowdScreenBlackout = 'block';
                    } else {
                        this.crowdScreenBlackout = 'none';
                    }

                    //this.camera = data.camera;
                } else {
                    this.crowdScreenBackgroundColor = '';
                    this.crowdScreenFunction = false;
                    this.crowdScreenIntensity = 0;
                    this.torch = false;
                    this.camera = false;
                    this.crowdScreenEnabled = false;
                    this.crowdScreenTorchDisplay = 'none';
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
                        if (this.torch) {
                            this.crowdScreenBackgroundColor = '#ffffff';
                        } else {
                            this.crowdScreenBackgroundColor = '#000000';
                        }
                        this.crowdScreenIntensity = Math.random();
                        this.applyConstraints();
                    }, intervalTime);
                }
                this.setCamera();
                this.applyConstraints();
            }

            //if (this.lastEnabled != this.crowdScreenEnabled) {
            //    window.location.reload();
            //}
            //this.lastEnabled = this.crowdScreenEnabled;


        });
        this.refreshCrowdScreen();

        //this.video2 = document.getElementById('externalVideo');
        //this.video2.onloadeddata = () => {
        //    this.video2.play();
        //};

        // get vars and then connect
        this.projectService.getEnvironment().then((res) => {
            this.environmentalVariables = res;
            this.createPeer(); // create the peer and wait for a call

        });

        // Get the refreshSignal
        this._remoteScreenRefresh = this.socketService.remoteScreenRefresh.subscribe(data => {
            window.location.reload();
        });

    }

    start(): any {
        //let vid: HTMLCanvasElement; // canvas for main three.js preview
        //let vid;
        //vid.play;
        this.video2 = document.getElementById('externalVideo');
        this.video2.play();

        this.started = true;
        let heartbeat: any = document.getElementById('heartbeat');
        heartbeat.onloadeddata = () => {
            heartbeat.play();
        };
        heartbeat.play();
        //this.video2.play();
        //this.video.play();
    }

    flipCam(e): any {
        if (this.facingMode == 'environment') {
            this.facingMode = 'user';
        } else {
            this.facingMode = 'environment';
        }
        this.setCamera();
    }

    unsetCamera(): any {
        this.facingMode = 'environment';
        this.setCamera();
    }

    playVideo(): any {

        console.log(this.video, this.video.paused);
        //if (this.video.paused) {
        this.video.play();
        //}
    }

    setCamera(): any {

        //this.facingMode = facingMode;

        //return new promise();
        console.log('support', SUPPORTS_MEDIA_DEVICES);

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
                    let obj;

                    // Create stream and get video track
                    if (this.mobile) {
                        obj = {
                            facingMode: { ideal: this.facingMode },
                            height: { ideal: 1080 },
                            width: { ideal: 1920 }
                        };
                    } else {
                        obj = {
                            height: { ideal: 1080 },
                            width: { ideal: 1920 }
                        };
                    }

                    navigator.mediaDevices.getUserMedia({
                        video: obj,
                        audio: false
                    }).then(stream => {
                        this.track = stream.getVideoTracks()[0];

                        //Create image capture object and get camera capabilities
                        //const imageCapture = new ImageCapture(this.track);
                        //const photoCapabilities = imageCapture.getPhotoCapabilities().then(() => {

                        this.gotCapabilities = true;
                        this.stream = stream;
                        this.video.srcObject = this.stream;// = window.URL.createObjectURL(stream);
                        //this.video.context
                        this.video.onloadeddata = () => {
                            //console.log('Video data loaded');
                            //console.log(this.video.videoWidth, this.video.videoHeight);
                            //console.log(this.video.width, this.video.height);   

                            // set the canvas up when the video is working
                            this.canvas.width = this.video.videoWidth;
                            this.canvas.height = this.video.videoHeight;
                            this.context = this.canvas.getContext('2d');
                            //canvasContext = canvas.getContext('2d');
                            this.playVideo();
                            this.applyConstraints();

                            //this.context.translate(this.video.videoWidth, 0);
                            //this.context.scale(-1, 1);
                        };

                        //this.videoContext =


                        //this.video.srcObject = stream;// = window.URL.createObjectURL(stream);
                        this.playVideo();
                        this.applyConstraints();

                        //});
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
        return new Promise((resolve, reject) => {
            if (!this.mobile || this.facingMode != 'environment') {
                resolve();
                return;
            }
            if (this.gotCapabilities) {
                try {
                    this.track.applyConstraints({
                        advanced: [<any>{ torch: this.torch, intensity: this.intensity }]
                    }).then(() => {
                        console.log('constraints applied');
                        resolve();
                    }, (err) => {
                        //alert('BETA' + err);
                        console.log('could not apply constraints beta', err);
                        reject();
                    });
                } catch (err) {
                    //alert('ALPHA' + err);
                    console.log('could not apply constraints alpha', err);
                    reject();
                }
            }
        });
    }

    takePic(e): any {


        if (this.canTakeImage == false) {
            alert('Please wait a bit to take another photo.');
            return;
        }

        this.canTakeImage = false;
        setTimeout(() => {
            this.canTakeImage = true;
        }, 10000);

        console.log('takePic');
        this.takingPic = true;
        this.torch = false;
        //this.setCamera('user');

        //setTimeout(() => {

        //this.canvas.width = this.video.width();
        //this.canvas.height = this.video.height();
        //console.log(this.video.videoWidth, this.video.videoHeight);
        //this.context = this.canvas.getContext('2d');

        //this.timer = '3';
        //setTimeout(() => {
        //this.timer = '2';
        //setTimeout(() => {
        //this.timer = '1';
        //setTimeout(() => {

        //this.timer = '';

        this.context.translate(this.canvas.width, 0);
        this.context.scale(-1, 1);

        //this.context.drawImage(image, 0, 0);

        this.context.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);
        let dataUri = this.canvas.toDataURL('image/jpeg'); // can also use 'image/png'
        this.socketService.sendCrowdScreenImage(dataUri);
        this.timer = 'Sending Photo To Screen';
        setTimeout(() => {

            this.takingPic = false;
            //this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
            //this.getSignedRequest(dataURI, 'image');
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.video.src = '';
            this.timer = '';
            //this.timer = 'Get Ready';
            //this.setCamera('environment');

        }, 3000);
        //}, 1000);
        //}, 1000);
        //}, 1000);
        //}, 2000);
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

    createPeer(): any {

        this.projectService.getIce(this.environmentalVariables).then((res: any) => {

            this.peer = new Peer({
                secure: true,
                host: this.environmentalVariables.PEERJS_SERVER,
                port: 443,
                debug: 3,
                config: {
                    'iceServers': res,
                    'iceTransportPolicy': 'relay'
                }
            });

            // When the peer connection opens get the id
            // - then send the id to the api server ws
            this.peer.on('open', (id) => {
                console.log('PEER OPEN', 'PEER ID:', id);
                this.peerId = id;
                
                // send 
                this.socketService.peerId({ windowId: false, peerId: id, mid: this.mid });

                // call 
                
            });

            // Then await for a call
            this.peer.on('call', (call) => {
                console.log('PEER RECIEVING CALL');
                //if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                //    var constraints = { audio: true, video: false };
                //    navigator.mediaDevices.getUserMedia(constraints).then((stream1) => {
                console.log('got userMedia, answering call');
                call.answer(); // answer the call, 
                call.on('stream', function (stream2) {
                    this.stream2 = stream2;
                    this.video2 = document.getElementById('externalVideo');
                    this.video2.srcObject = stream2;
                    this.video2.play();
                });
            });

            this.peer.on('close', () => {
                console.log('PEER CLOSE');
                this.peer = null;
                this.createPeer();
            });

            this.peer.on('disconnected', () => {
                console.log('PEER DISCONNECTED');
                this.createPeer();
            });

            this.peer.on('error', (err) => {
                console.log('PEER ERR', err);
                this.createPeer();
            });

        });
    }
}
