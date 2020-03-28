import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Observer } from 'rxjs';
import { environment } from '../environments/environment';

import { Socket } from 'ngx-socket-io';
import { Document } from './models/document';

@Injectable({
    providedIn: 'root'
})
export class SocketService {

    currentDocument = this.socket.fromEvent<Document>('document');
    anything = this.socket.fromEvent<any>('testclient');
    made = this.socket.fromEvent<any>('made');
    getRemoteQue = this.socket.fromEvent<any>('getRemoteQue');
    getCrowdScreen = this.socket.fromEvent<any>('getCrowdScreen');
    getLaserz = this.socket.fromEvent<any>('getLaserz');
    getRemoteQueAuthorizationConfirmation = this.socket.fromEvent<any>('getRemoteQueAuthorizationConfirmation');
    getRemoteQueAuthorizationDenied = this.socket.fromEvent<any>('getRemoteQueAuthorizationDenied');
    clientCount = this.socket.fromEvent<any>('clientCount');
    ping = this.socket.fromEvent<any>('ping');

    constructor(private socket: Socket) { }

    connect(mid, roomName = false, userId = false, peerId = false): any {
        //return new Promise((resolve, reject) => {
        this.socket.ioSocket.io.opts.query = { mid: mid, roomName: roomName, userId: userId, peerId: peerId } //new options
        this.socket.connect(); //manually connection
        //    this.socket.ioSocket.io.on('connection', () => {
        //        resolve();
        //    });
        //});


    }

    pong(): any {
        this.socket.emit('pong');
    }

    sendMake(data): any {
        this.socket.emit('make', data);
    }

    refreshQue(): any {
        this.socket.emit('refreshQue');
    }

    refreshCrowdScreen(): any {
        this.socket.emit('refreshCrowdScreen');
    }

    refreshLaserz(): any {
        this.socket.emit('refreshLaserz')
    }

    play(): any {
        this.socket.emit('play');
    }

    stop(): any {
        this.socket.emit('stop');
    }

    nextTrack(): any {
        this.socket.emit('nextTrack');
    }

    changeTrack(i): any {
        this.socket.emit('changeTrack', i);
    }

    authorize(password): any {
        console.log('authorize in socket', password);
        this.socket.emit('remoteQueAuthorize', password);
    }

    sendCrowdScreenImage(dataUri): any {
        console.log('send crowdscreen image', dataUri);
        this.socket.emit('sendCrowdScreenImage', dataUri);
    }

    peerId(data): any {
        console.log('send peerId to api socket', data);
        this.socket.emit('peerId', data)
    }
}
