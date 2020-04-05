import { Component, OnInit } from '@angular/core';
import { ViewChild, HostListener, ElementRef, NgZone, ApplicationRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { SocketService } from '../socket.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

@Component({
    selector: 'app-remote-que',
    templateUrl: './remote-que.component.html',
    styleUrls: ['./remote-que.component.scss']
})
export class RemoteQueComponent implements OnInit {

    auth: any = false;
    mid: any = '';
    set: any = {};
    tracks: any = [];
    currentTrack: any = 0;
    playing: any = false;
    lastData: any = {};
    password: any = '';

    currentRoute: any = '';
    private _getRemoteQue: Subscription;
    private _getRemoteQueAuthorizationConfirmation: Subscription;
    private _getRemoteQueAuthorizationDenied: Subscription;

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

        this.socketService.connect(this.mid);

        this._getRemoteQueAuthorizationConfirmation = this.socketService.getRemoteQueAuthorizationConfirmation.subscribe(data => {
            console.log('Authorization', data);
            this.auth = true;
            //localStorage.setItem('auth-' + this.mid, 'true');
        });

        this._getRemoteQueAuthorizationDenied = this.socketService.getRemoteQueAuthorizationDenied.subscribe(data => {
            console.log('Authorization Denied', data);
            this.auth = false;
        });

        this._getRemoteQue = this.socketService.getRemoteQue.subscribe(data => {
            if (JSON.stringify(data) === JSON.stringify(this.lastData)) {
                ///
            } else {
                console.log('receiving getRemoteQue', data);
                this.set = data.set;
                this.playing = data.playing;
                this.tracks = data.tracks;
                this.currentTrack = data.currentTrack;
            }
            this.lastData = data;
        });

        this.refreshQue();
    }

    refreshQue(): any {
        this.socketService.refreshQue();
    }

    play(): any {
        this.socketService.play();
    }

    stop(): any {
        this.socketService.stop();
    }

    nextTrack(): any {
        this.socketService.nextTrack();
    }

    changeTrack(i): any {
        this.socketService.changeTrack(i);
    }

    authorize(e): any {
        console.log('authorize', this.password)
        this.socketService.authorize(this.password);
    }
}
