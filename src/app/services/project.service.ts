import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class ProjectService {
    public video: any;
    public apiUrl: any = environment.ioUrl;
    public plan: any = 0;

    constructor(private httpClient: HttpClient) { }

    getEnvironment(): any {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', this.apiUrl + '/api/env', true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const response = xhr.responseText;
                        resolve(JSON.parse(response));
                        return;
                    }
                    else {
                        reject('err');
                        return;
                    }
                }
            };
            xhr.send();
        });
    }

    formatIceForPeerJs(servers) {
        let ice = [];
        servers.v.iceServers.urls.forEach(element => {
            let server;
            if (element.includes('stun')) {
                server = { url: element };
            } else {
                server = { url: element, username: servers.v.iceServers.username, credential: servers.v.iceServers.credential };
            }
            ice.push(server);
        });
        return ice;
    }

    getIce(ev) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = ($evt) => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    let res = JSON.parse(xhr.responseText);
                    res = this.formatIceForPeerJs(res);
                    resolve(res);
                    console.log("response: ", res);
                }
            }
            xhr.open("PUT", "https://global.xirsys.net/_turn/" + ev.XIRSYS_CHANNEL, true);
            xhr.setRequestHeader("Authorization", "Basic " + btoa(ev.XIRSYS_IDENTITY + ":" + ev.XIRSYS_SECRET));
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify({ "format": "urls" }));
        });
    }

    authSeatEmail(email): any {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let params = 'email=' + email;
            xhr.open('POST', this.apiUrl + '/api/authSeat/email', true);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const response = xhr.responseText;
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

}
