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
    userProfile: any;
    // detect the route
    constructor(private route: ActivatedRoute, private router: Router, private auth: AuthService) {

        console.log('auth', auth);

        //if (auth.loggedIn) {
        //    this.userProfile = auth.userProfile$;
        //    console.log('userProfile', this.userProfile);
        //}

        // Removes the header, etc.....
        router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.currentRoute = val.url;
                console.log('route', this.currentRoute);
                if (
                    this.currentRoute.includes('welcome') ||
                    this.currentRoute.includes('crowdscreen') ||
                    this.currentRoute.includes('crowdcam') ||
                    this.currentRoute.includes('laserz') ||
                    this.currentRoute.includes('remote-cam') ||
                    this.currentRoute.includes('remote-que') ||
                    this.currentRoute.includes('remote-screen')
                ) {
                    this.interactive = true;
                } else {
                    this.interactive = false;
                }
            }
        });
    }

}
