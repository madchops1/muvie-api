import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { SocketService } from '../socket.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import Peer from 'peerjs';

const SUPPORTS_MEDIA_DEVICES = 'mediaDevices' in navigator;

@Component({
    selector: 'app-remote-cam',
    templateUrl: './remote-cam.component.html',
    styleUrls: ['./remote-cam.component.scss']
})

export class RemoteCamComponent implements OnInit {

    userAgent: any = false;
    mobile: any = true; // start true on purpose
    currentRoute: any = '';
    mid: any = '';
    pid: any = '';
    sid: any = '';
    started: any = false;
    msg: any = '';
    track: any = false;
    stream: any = false;
    liveStreamStatus: any = false;
    onTheAir: any = false;
    torch: any = false;
    facingTorch: any = false;
    peer: any = false;
    peerId: any = false;

    facingMode: any = 'environment';

    @ViewChild('videoElement') videoElement: any;
    video: any;

    private _getOnTheAir: Subscription;
    private _ping: Subscription;

    constructor(private route: ActivatedRoute, private router: Router, private socketService: SocketService) {

        // get the mid, peerid, and scene/module uuid from the URL
        router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.currentRoute = val.url;
                let routeArray = this.currentRoute.split("/");
                this.mid = routeArray[routeArray.length - 3];
                this.pid = routeArray[routeArray.length - 2];
                this.sid = routeArray[routeArray.length - 1];

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

        console.log('IS MOBILE:', this.mobile);

        // Video element and canvas element for photo taking and preview
        this.video = this.videoElement.nativeElement;

        // Connect to ws
        this.socketService.connect(this.mid);

        // ws ping/pong
        this._ping = this.socketService.ping.subscribe(() => {
            this.socketService.pong();
        });

        this._getOnTheAir = this.socketService.getOnTheAir.subscribe((data) => {
            console.log('getOnTheAirData', data);
            if (data.peerId == this.peerId) {
                this.onTheAir = true;
            } else {
                this.onTheAir = false;
            }
        });

        this.setCamera(this.facingMode);
    }

    callPeer(id) {
        return new Promise((resolve, reject) => {
            let call = this.peer.call(id, this.stream);

            call.on('stream', function (stream) {
                this.liveStreamStatus = true;
                console.log('this is the remote windows stream', stream);
                // `stream` is the MediaStream of the remote peer.
                // Here you'd add it to an HTML video/canvas element.
            });
            resolve();
        });
    }

    createPeer() {
        //this.peer = null;
        return new Promise((resolve, reject) => {

            if (this.peerId) { resolve(this.peerId); return; }

            this.peer = new Peer({});

            this.peer.on('open', (id) => {
                console.log('My peer ID is: ' + id);
                this.peerId = id;
                resolve(id);
            });

            this.peer.on('close', () => {
                //this.peer = null;
                this.peerId = false;
            });

            this.peer.on('disconnected', () => {
                this.peer.reconnect();
            });

            this.peer.on('error', (err) => {
                console.log('PEER ERR', err);
                this.peerId = false;
            });
        });
    }

    setCamera(facingMode): any {

        this.facingMode = facingMode;

        //return new promise();
        console.log('support', SUPPORTS_MEDIA_DEVICES);

        if (SUPPORTS_MEDIA_DEVICES) {
            //Get the environment camera (usually the second one)
            navigator.mediaDevices.enumerateDevices().then(devices => {

                const cameras = devices.filter((device) => device.kind === 'videoinput');
                console.log('cameras', cameras);
                if (cameras.length === 0) {
                    this.msg = 'No camera found on this device.';
                } else {
                    const camera = cameras[cameras.length - 1];
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

                        //this.gotCapabilities = true;
                        this.stream = stream;
                        this.video.srcObject = this.stream; // = window.URL.createObjectURL(stream);

                        //
                        if (!this.liveStreamStatus) {
                            this.createPeer().then(() => {

                                this.callPeer(this.pid);

                            }, (err) => {
                                console.log('err', err);
                            });
                        }





                        //this.video.context
                        this.video.onloadeddata = () => {
                            //console.log('Video data loaded');
                            //console.log(this.video.videoWidth, this.video.videoHeight);
                            //console.log(this.video.width, this.video.height);   

                            // set the canvas up when the video is working
                            // this.canvas.width = this.video.videoWidth;
                            // this.canvas.height = this.video.videoHeight;
                            // this.context = this.canvas.getContext('2d');
                            //canvasContext = canvas.getContext('2d');
                            this.video.play();

                            //this.applyConstraints();

                            //this.context.translate(this.video.videoWidth, 0);
                            //this.context.scale(-1, 1);
                        };

                        //this.videoContext =
                        //this.video.srcObject = stream;// = window.URL.createObjectURL(stream);
                        this.video.play();
                        this.applyConstraints();
                    }, (err) => {
                        console.log('err', err);
                        alert('Could not start the camera.');
                    });
                }
            });
        }
    }

    start(): any {
        this.started = true;
    }

    flipCam(e): any {
        this.torch = false;
        this.applyConstraints();
        if (this.facingMode == 'environment') {
            this.setCamera('user');
        } else {
            this.setCamera('environment');
        }
    }

    toggleFlash(e): any {
        this.torch = !this.torch;
        this.applyConstraints();
    }

    applyConstraints(): any {
        return new Promise((resolve, reject) => {

            if (!this.mobile) {
                resolve();
                return;
            }

            let realTorch = this.torch;
            if (this.facingMode == 'user') {
                if (this.torch) {
                    this.facingTorch = true;
                } else {
                    this.facingTorch = false;
                }
                realTorch = false;
            }

            try {
                this.track.applyConstraints({
                    advanced: [<any>{ torch: realTorch, intensity: 1 }]
                }).then(() => {
                    console.log('constraints applied');
                    resolve();
                }, (err) => {
                    console.log('could not apply constraints beta', err);
                    reject();
                });
            } catch (err) {
                console.log('could not apply constraints alpha', err);
                reject();
            }
        });
    }


}
