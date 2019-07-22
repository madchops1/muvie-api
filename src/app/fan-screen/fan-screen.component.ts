import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { SocketService } from '../socket.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
//import { Flashlight } from '@ionic-native/flashlight';
import "p5/lib/addons/p5.sound";
import "p5/lib/addons/p5.dom";

const SUPPORTS_MEDIA_DEVICES = 'mediaDevices' in navigator;

@Component({
    selector: 'app-fan-screen',
    templateUrl: './fan-screen.component.html',
    styleUrls: ['./fan-screen.component.scss']
})
export class FanScreenComponent implements OnInit {

    mid: any = '';
    torch: any = true;
    //torchCompatible
    crowdScreenBackgroundColor: any = 'transparent';
    
    currentRoute: any = '';
    camera: any = false;
    track: any = false;
    msg: any = "";
    

    private _getCrowdScreen: Subscription;

    

    constructor(private route: ActivatedRoute, private router: Router, private socketService: SocketService) { 
        router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.currentRoute = val.url;
                let routeArray = this.currentRoute.split("/");
                this.mid = routeArray[routeArray.length - 1];
                console.log('mid', this.mid);
            }
        });

        /*
        flashlight.available(function(isAvailable) {
            if (isAvailable) {
          
              // switch on
              flashlight.switchOn(
                function() {}, // optional success callback
                function() {}, // optional error callback
                {intensity: 0.3} // optional as well
              );
          
              // switch off after 3 seconds
              setTimeout(function() {
                flashlight.switchOff(); // success/error callbacks may be passed
              }, 3000);
          
            } else {
              this.msg = "Flashlight not available on this device";
            }
          });
        */
    }

    ngOnInit() {
        this.socketService.connect(this.mid);

        this._getCrowdScreen = this.socketService.getCrowdScreen.subscribe(data => {
            
            console.log('receiving getCrowdScreen', data);
            this.crowdScreenBackgroundColor = data.backgroundColor;
            if(data.torch) {
                
                
            }

        });

        this.refreshCrowdScreen();
        
    }

    refreshCrowdScreen(): any {
        this.socketService.refreshCrowdScreen();
    }

}
