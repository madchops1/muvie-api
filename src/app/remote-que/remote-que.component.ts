import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { SocketService } from '../socket.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

@Component({
    selector: 'app-remote-que',
    templateUrl: './remote-que.component.html',
    styleUrls: ['./remote-que.component.scss']
})
export class RemoteQueComponent implements OnInit {

    mid: any = '';
    set: any = {};
    tracks: any = [];
    currentTrack: any = 0;
    playing: any = false;

    //private _anythingSub: Subscription;
    currentRoute: any = '';
    private _getRemoteQue: Subscription;

    constructor(private route: ActivatedRoute, private router: Router, private socketService: SocketService) {
        router.events.subscribe((val) => {
            // see also 
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

        this._getRemoteQue = this.socketService.getRemoteQue.subscribe(data => {
            console.log('receiving getRemoteQue', data);
            this.tracks = data.tracks;
            this.currentTrack = data.currentTrack;
            this.set = data.set;
            this.playing = data.playing;
        });

        this.refreshQue();

        //this._anythingSub = this.socketService.anything.subscribe(item => {
        //    console.log('received anything sub', item)
        //});

        //this.socketService.refresh();

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
        this.currentTrack = i;
        this.socketService.changeTrack(i);
    }

    //getTracks(): any {
    //    //this.socketService.getTracks(mid);
    //}
}
