import { Component, OnInit } from '@angular/core';
import { ViewChild, HostListener, ElementRef, NgZone, ApplicationRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { SocketService } from '../socket.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import Peer from 'peerjs';

@Component({
    selector: 'app-remote-screen',
    templateUrl: './remote-screen.component.html',
    styleUrls: ['./remote-screen.component.scss']
})
export class RemoteScreenComponent implements OnInit {

    currentRoute: any = '';
    peer: any = null;
    video: any;
    mid: any;
    remotePeerId: any;
    peerId: any = false;

    constructor(private route: ActivatedRoute, private router: Router, private socketService: SocketService) {
        router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.currentRoute = val.url;
                let routeArray = this.currentRoute.split("/");
                this.mid = routeArray[routeArray.length - 1];
                this.remotePeerId = routeArray[routeArray.length - 2];
                console.log('mid', this.mid);
                console.log('remotePeerId', this.remotePeerId);
            }
        });
    }

    ngOnInit() {
        this.socketService.connect(this.mid);   // connect to the api server socket
        this.connectPeer();                     // create the peer and wait for a call
    }

    connectPeer() {
        this.peer = new Peer();

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
                this.video = document.getElementById('externalVideo');
                this.video.srcObject = stream2;
            });
            //});
            //}
        });

        this.peer.on('close', () => {
            this.peer = null;
            this.connectPeer();
        });

        this.peer.on('disconnected', () => {
            if (this.peer) {
                this.peer.reconnect();
            } else {
                this.connectPeer();
            }
        });

        this.peer.on('error', (err) => {
            console.log('PEER ERR', err);
            this.connectPeer();
        });
    }
}
