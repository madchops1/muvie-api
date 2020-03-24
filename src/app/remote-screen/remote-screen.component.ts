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
    //url: any = window.document.URL.split('#');
    //windowId: any = url[1];
    //idArray: any = windowId.split(':');
    //env: any = idArray[1];
    //wsUrl: any = 'https://www.visualzstudio.com'; // production
    mid: any;
    remotePeerId: any;
    //socket: any;
    peerId: any = false;
    //numericId: any = idArray[3];

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

        // connect to the api server socket
        this.socketService.connect(this.mid);

        // create the peer and wait for a call
        this.connectPeer();
        // if (env == 'dev') {
        //     wsUrl = 'https://visualz.ngrok.io';
        // }

        // connectSocket();

        // function connectSocket() {
        //     socket = io(wsUrl);
        //     socket.io.opts.query = { mid: mid };
        //     //socket.emit('test', { mid: mid });
        // }

        // function connectPeer() {
        //     peer = new Peer();
        //     peer.on('open', (id) => {
        //         console.log('My peer ID is: ' + id);
        //         socket.emit('peerId', { windowId: numericId, peerId: id, mid: mid });
        //     });
        //     peer.on('call', function (call) {
        //         call.answer(); // answer the call
        //         call.on('stream', function (stream) {
        //             video = document.getElementById('externalVideo');
        //             video.srcObject = stream;
        //         });
        //     });
        //     peer.on('close', () => {
        //         this.peer = null;
        //         connectPeer();
        //     });
        //     peer.on('disconnected', () => {
        //         if (this.peer) {
        //             this.peer.reconnect();
        //         } else {
        //             connectPeer();
        //         }
        //     });
        //     peer.on('error', (err) => {
        //         console.log('PEER ERR', err);
        //         connectPeer(windowId);
        //     });
        // }

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
            call.answer(); // answer the call, send the microphone audio back
            call.on('stream', function (stream) {
                this.video = document.getElementById('externalVideo');
                this.video.srcObject = stream;
            });
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

    // createPeer() {

    //     return new Promise((resolve, reject) => {

    //         this.peer = new Peer();

    //         this.peer.on('open', (id) => {
    //             console.log('My peer ID is: ' + id);
    //             this.peerId = id;
    //             resolve(id);
    //         });

    //         this.peer.on('close', () => {
    //             this.peerId = false;
    //         });

    //         this.peer.on('disconnected', () => {
    //             this.peer.reconnect();
    //         });

    //         this.peer.on('error', (err) => {
    //             console.log('PEER ERR', err);
    //             alert(err);
    //             this.peerId = false;

    //         });

    //     });
    // }

}
