/**
 * Deprecated
 * This is old. There are no more laserz.
 * ...For Now. Bwa hahahaha.
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { SocketService } from '../services/socket.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

@Component({
    selector: 'app-laserz',
    templateUrl: './laserz.component.html',
    styleUrls: ['./laserz.component.scss']
})
export class LaserzComponent implements OnInit {

    mid: any = '';
    currentRoute: any = '';
    redLaser: any = false;
    greenLaser: any = false;
    blueLaser: any = false;

    private _getLaserz: Subscription;
    private _ping: Subscription;

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

        // Connect to ws
        this.socketService.connect(this.mid);

        // ws ping/pong
        this._ping = this.socketService.ping.subscribe(() => {
            this.socketService.pong();
        });

        // Get crowdscreen data from ws
        this._getLaserz = this.socketService.getLaserz.subscribe(data => {
            console.log('getLaserz', data);
            this.redLaser = data.redLaser;
            this.greenLaser = data.greenLaser;
            this.blueLaser = data.blueLaser;
        });

    }

}
