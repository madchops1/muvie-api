import { Component } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ProfileService } from './services/profile.service';
import { CartService } from './services/cart.service';

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
    menu: any = false;

    // detect the route
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private auth: AuthService,
        private profile: ProfileService,
        private cart: CartService) {

        // Removes the header, etc.....
        router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.currentRoute = val.url;
                console.log('route', this.currentRoute);
                window.scrollTo(0, 0);
                this.menu = false;

                // This is a mode for pages that are used by the VISUALZ application
                if (
                    this.currentRoute.includes('welcome') ||
                    this.currentRoute.includes('crowdscreen') || // FanCam/Crowdscreen
                    this.currentRoute.includes('crowdcam') || 
                    this.currentRoute.includes('laserz') ||
                    this.currentRoute.includes('mobile-video') ||
                    this.currentRoute.includes('remote-que') ||
                    this.currentRoute.includes('remote-screen') ||
                    this.currentRoute.includes('live/')
                )
                {
                    this.interactive = true;
                }
                // This is a mode for normal website pages
                else {
                    this.interactive = false;

                    // Check if the user is 
                    console.log('auth', auth);

                    if (auth.loggedIn) {
                        this.profile.setProfile();
                    }

                }
            }
        });
    }

    toggleMenu(): any {
        this.menu = !this.menu;
    }

}
