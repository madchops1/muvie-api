import { Injectable } from '@angular/core';
import * as mixpanel from 'mixpanel-browser';

@Injectable({
    providedIn: 'root'
})

export class MixpanelService {

    constructor() { }
    initiated: any = false;

    /**
     * Initialize mixpanel.
     *
     * @param {string} userToken
     * @memberof MixpanelService
     */
    init(userToken: string): void {
        mixpanel.init('06602639174df16f0e1ea451cbce7e11');
        //console.log('User Token', userToken);
        mixpanel.identify(userToken);
        this.initiated = true;
        mixpanel.people.set({
            "$last_login": new Date()
        });
    }

    /**
     * Push new action to mixpanel.
     *
     * @param {string} id Name of the action to track.
     * @param {*} [action={}] Actions object with custom properties.
     * @memberof MixpanelService
     */
    track(id: string, action: any = {}): void {
        if (this.initiated) {
            //console.log('Mixpanel Event', id, action);
            mixpanel.track(id, action);
        }
    }
}
