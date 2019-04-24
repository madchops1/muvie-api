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

    constructor(private socket: Socket) {
        this.socket.emit('test', 'alpha');
    }

    sendMake(data): any {
        this.socket.emit('make', data);
    }



}
