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

    constructor(private socket: Socket) {
        //this.socket.emit('test', 'alpha');
    }

    connect(mid): any {
        //this.socket.connectWithParams()
        this.socket.ioSocket.io.opts.query = { mid: mid } //new options
        //this.socket.ioSocket.io.uri = "http://localhost:3001" //new uri
        this.socket.connect(); //manually connection
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



}
