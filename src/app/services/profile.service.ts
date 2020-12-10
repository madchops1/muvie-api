import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {

    profile: any;

    constructor(public auth: AuthService) { }

    /**
     * Call the api
     * - Inserts or Updates the user based on their email.
     */
    profileCheck(email) {
        return new Promise((resolve, reject) => {

            const xhr = new XMLHttpRequest();
            let params = 'email=' + email;
            xhr.open('POST', environment.ioUrl + '/api/profilecheck', true);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const response = xhr.responseText;
                        console.log('CHARLIE', response);
                        resolve(response);
                    }
                    else {
                        console.log('Error');
                        reject('err');
                    }
                }
            };
            xhr.send(params);
        });

    }
    /**
     * Insert/Update the Artist/User from their Auth0 data
     *   - also returns the user's profile to get fields such as:
     *     - name
     *     - city
     *     - state
     *     - country       
     */
    setProfile() {
        if (this.auth.loggedIn && !this.profile) {
            this.auth.userProfile$.subscribe((profile) => {
                console.log('TEST ALPHA', 'setProfile', profile);
                this.profile = profile;

                // Insert.Update the database
                this.profileCheck(this.profile.email).then((res) => {
                    console.log('TEST BETA', 'response', res);
                }, (err) => {
                    console.log(err);
                });
            });
        }
    }

    clearProfile() {
        this.profile = false;
    }
}
