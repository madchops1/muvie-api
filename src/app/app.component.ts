import { Component } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'VISUALZ';
    currentRoute = '';
    interactive: any = false;

    // detect the route
    constructor(private route: ActivatedRoute, private router: Router, private auth: AuthService) {

        // Handle mobile visualz pages
        router.events.subscribe((val) => {
            // see also 
            if (val instanceof NavigationEnd) {
                console.log('route', val);
                this.currentRoute = val.url;
                if (
                    this.currentRoute.includes('welcome') ||
                    this.currentRoute.includes('crowdscreen') ||
                    this.currentRoute.includes('crowdcam') ||
                    this.currentRoute.includes('laserz') ||
                    this.currentRoute.includes('remote-cam') ||
                    this.currentRoute.includes('remote-que')) {
                    this.interactive = true;
                } else {
                    this.interactive = false;
                }
            }
        });
    }

}
