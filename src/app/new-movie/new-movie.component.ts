import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { Observer } from 'rxjs';
import { UploadService } from '../upload/upload.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SocketService } from '../socket.service';
import { ProjectService } from '../project.service';
import { Router } from '@angular/router';


@Component({
    selector: 'app-new-movie',
    templateUrl: './new-movie.component.html',
    styleUrls: ['./new-movie.component.scss']
})
export class NewMovieComponent implements OnInit, OnDestroy {

    msbapTitle = 'Audio Title';
    msbapAudioUrl: any = false;
    msbapDisplayTitle = false;
    timePeriods = [
        'Bronze age',
        'Iron age',
        'Middle ages',
        'Early modern period',
        'Long nineteenth century'
    ];
    uploadingAudio: any = false;
    uploadingVideo: any = false;

    clips: any = [];

    //currentDoc: string;
    private _anythingSub: Subscription;
    private _madeSub: Subscription;

    constructor(private upload: UploadService,
        private socketService: SocketService,
        private projectService: ProjectService,
        private router: Router) { }

    ngOnInit() {


        // Connect to ws
        this.socketService.connect('website');

        this._anythingSub = this.socketService.anything.subscribe(item => {
            console.log('anything sub', item)
        });

        this._madeSub = this.socketService.made.subscribe(item => {
            console.log('made sub', item);
            this.projectService.video = item.withWatermark;
            this.router.navigate(['/filter']);
        });

    }

    ngOnDestroy() {
        this._anythingSub.unsubscribe();
        this._madeSub.unsubscribe();
    }

    make(): any {
        console.log('make');
        let data = {
            audio: this.msbapAudioUrl,
            clips: this.clips
        };
        this.socketService.sendMake(data);
        //const xhr = new XMLHttpRequest();
        //xhr.open('POST', `/api/make`, true);
        //xhr.setRequestHeader("Content-Type", "application/json");

        //xhr.onreadystatechange = function () { // Call a function when the state changes.
        //    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        //        // Request finished. Do processing here.
        //        console.log('success', this.responseText);
        //    }
        //}
        //xhr.send(JSON.stringify(data));

        //xhr.onload = function () {
        //    // do something to response
        //    console.log('success', this.responseText);
        //};
        //xhr.send(data);

    }
    /*
    make(): any {
        console.log('make');
        let data = {
            audio: this.msbapAudioUrl,
            clips: this.clips
        };
        //var data = new FormData();
        //data.append('user', 'person');
        //data.append('pwd', 'password');
        //data.append('organization', 'place');
        //data.append('requiredkey', 'key');
        //data.clips = this.clips);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `/api/make`, true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function () { // Call a function when the state changes.
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                // Request finished. Do processing here.
                console.log('success', this.responseText);
            }
        }
        xhr.send(JSON.stringify(data));
        //xhr.onload = function () {
        //    // do something to response
        //    console.log('success', this.responseText);
        //};
        //xhr.send(data);

    }
    */

    drop(event: CdkDragDrop<string[]>) {
        console.log('drop');
        moveItemInArray(this.timePeriods, event.previousIndex, event.currentIndex);
    }

    // At the file input element
    uploadAudioFile(event): any {
        this.uploadingAudio = true;
        //console.log('uploadAudioFile');
        const files = event.target.files;
        //const files = document.getElementById('file-input').files;
        const file = files[0];
        if (file == null) {
            return alert('No file selected.');
        }
        this.getSignedRequest(file, 'audio');
    }

    uploadVideoFile(event): any {
        this.uploadingVideo = true;
        //console.log('uploadAudioFile');
        const files = event.target.files;
        //const files = document.getElementById('file-input').files;
        const file = files[0];
        if (file == null) {
            return alert('No file selected.');
        }
        this.getSignedRequest(file, 'video');
    }

    getSignedRequest(file, type): any {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `/api/sign-s3?file-name=${file.name}&file-type=${file.type}`);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    this.uploadFile(file, response.signedRequest, response.url, type);
                }
                else {
                    alert('Could not get signed URL.');
                }
            }
        };
        xhr.send();
    }

    uploadFile(file, signedRequest, url, type): any {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signedRequest);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    //let response = JSON.parse(xhr.responseText);
                    console.log('Uploaded.', xhr.responseURL);
                    let s = xhr.responseURL
                    s = s.substring(0, s.indexOf('?'));
                    if (type == 'audio') {
                        this.msbapAudioUrl = s;
                        this.uploadingAudio = false;
                    }
                    if (type == 'video') {
                        this.clips.push(s);
                        this.uploadingVideo = false;
                    }
                }
                else {
                    alert('Could not upload file.');
                }
            }
        };
        xhr.send(file);
    }


}
