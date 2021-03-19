import { Component, OnInit } from '@angular/core';
import { ViewChild, HostListener, ElementRef, NgZone, ApplicationRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { SocketService } from '../services/socket.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { UtilityService } from '../services/utility.service';
import { ProjectService } from '../services/project.service';
import Peer from 'peerjs';

@Component({
    selector: 'app-remote-screen',
    templateUrl: './remote-screen.component.html',
    styleUrls: ['./remote-screen.component.scss']
})
export class RemoteScreenComponent implements OnInit {

    environmentalVariables: any;
    currentRoute: any = '';
    peer: any = null;
    video: any;
    mid: any;
    remotePeerId: any;
    peerId: any = false;
    plan: any = 0;
    qr: any = '';
    stream2: any = false;
    started: any = false;
    private _remoteScreenRefresh: Subscription;

    constructor(private projectService: ProjectService, private utilityService: UtilityService, private route: ActivatedRoute, private router: Router, private socketService: SocketService) {
        router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.currentRoute = val.url;
                let routeArray = this.currentRoute.split("/");
                this.mid = routeArray[routeArray.length - 1];
                //this.remotePeerId = routeArray[routeArray.length - 3];
                this.plan = routeArray[routeArray.length - 2];
                console.log('mid', this.mid);
                //console.log('remotePeerId', this.remotePeerId);
            }
        });
    }

    ngOnInit() {
        this.socketService.connect(this.mid); // connect to the api server socket
        this.utilityService.generateQR('remote-screen', this.mid, this.plan).then((res) => {
            console.log('QR', res);
            this.qr = res;
        });

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
        //vid = document.getElementById('vid');
        //vid.play();
        this.video = document.getElementById('externalVideo');
        this.started = true;
        this.video.play();

    }
    createPeer() {
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
                console.log('My peer ID is: ' + id);
                this.peerId = id;
                this.socketService.peerId({ windowId: false, peerId: id, mid: this.mid });
            });

            // Then await for a call
            this.peer.on('call', (call) => {
                //console.log('receiving call');
                //if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                //    var constraints = { audio: true, video: false };
                //    navigator.mediaDevices.getUserMedia(constraints).then((stream1) => {
                console.log('got userMedia, answering call');
                call.answer(); // answer the call, send the microphone audio
                call.on('stream', function (stream2) {
                    console.log('STREAM', stream2);
                    this.stream2 = stream2;
                    this.video = document.getElementById('externalVideo');
                    this.video.srcObject = stream2;
                    if(this.started) {
                        this.video.play();
                    }
                });
                //});
                //}
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
