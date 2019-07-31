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
    getRemoteQueAuthorizationConfirmation = this.socket.fromEvent<any>('getRemoteQueAuthorizationConfirmation');
    getRemoteQueAuthorizationDenied = this.socket.fromEvent<any>('getRemoteQueAuthorizationDenied');
    
    ping = this.socket.fromEvent<any>('ping');

    constructor(private socket: Socket) { }

    connect(mid): any {
        this.socket.ioSocket.io.opts.query = { mid: mid } //new options
        this.socket.connect(); //manually connection
    }

    pong():any {
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
}
