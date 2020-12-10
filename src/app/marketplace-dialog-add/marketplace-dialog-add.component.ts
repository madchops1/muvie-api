import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { MixpanelService } from '../services/mixpanel.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';

let async = require("async");

@Component({
    selector: 'app-marketplace-dialog-add',
    templateUrl: './marketplace-dialog-add.component.html',
    styleUrls: ['./marketplace-dialog-add.component.scss']
})

export class MarketplaceDialogAddComponent implements OnInit {

    message: any = '';
    loadingRawFiles: any = false;
    loadingMp4File: any = false;
    loadingSetFile: any = false;
    pack: any = {
        name: '',
        description: '',
        price: 0,
        rawFiles: [],
        setFile: { signedRequest: '', url: '' },
        mp4File: { signedRequest: '', url: '' },
        artistId: false
    };
    button: any = 'Submit';
    success;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<MarketplaceDialogAddComponent>,
        public auth: AuthService,
        private profile: ProfileService,
        private mixpanelService: MixpanelService,
        public _snackBar: MatSnackBar) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    ngOnInit() {

        console.log('ALPHA', this.data);

        if (this.auth.loggedIn) {
            this.auth.userProfile$.subscribe((pro) => {
                this.pack.artistId = this.profile.profile.email;
            });
        }
    }

    uploadRawFiles(event) {
        let rawFiles = event.target.files;
        const promises = [];
        this.message = 'Uploading raw files.';
        this.loadingRawFiles = true;
        for (let i = 0; i < rawFiles.length; i++) {
            let file = rawFiles[i];
            let promise = (callback) => {
                this.getSignedRequest(file).then((res) => {
                    callback(null, res);
                });
            };
            promises.push(promise);
        }
        async.series(promises,
            (err, results) => {
                console.log('ALPHA', err, results);
                this.pack.rawFiles = results;
                this.loadingRawFiles = false;
                if (err) {
                    this.message = 'Error uploading raw files.';
                    return false;
                }
                this.message = '';
                return;
            });
    }

    uploadSetFile(event) {
        let setFile = event.target.files[0];
        this.message = 'Uploading .visualz file.';
        this.loadingSetFile = true;
        this.getSignedRequest(setFile).then((res) => {
            console.log('ECHO', res);
            this.pack.setFile = res;
            this.message = '';
            this.loadingSetFile = false;
        }, (err) => {
            this.message = 'Error uploading .visualz file.';
            this.loadingSetFile = false;
        });
    }

    uploadMp4File(event) {
        let mp4File = event.target.files[0];
        this.message = 'Uploading .mp4 preview file.';
        this.loadingMp4File = true;
        this.getSignedRequest(mp4File).then((res) => {
            this.pack.mp4File = res;
            this.message = '';
            this.loadingMp4File = false;
        }, (err) => {
            this.message = 'Error uploading .mp4 file.';
            this.loadingMp4File = false;
        });
    }

    getSignedRequest(file): any {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', environment.ioUrl + `api/sign-s3?file-name=${file.name}&file-type=${file.type}`);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        this.uploadFile(file, response.signedRequest, response.url).then((res) => {
                            resolve(response);
                        }, (err) => {
                            reject(err);
                        });
                    }
                    else {
                        reject('Could not get signed URL.');
                    }
                }
            };
            xhr.send();
        });
    }

    uploadFile(file, signedRequest, url): any {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', signedRequest);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve('Uploaded');
                    }
                    else {
                        reject('Could not upload file.');
                    }
                }
            };
            xhr.send(file);
        });
    }

    validate(): any {
        if (this.loadingMp4File == true || this.loadingRawFiles == true || this.loadingSetFile == true) {
            this.message = "Still uploading files...";
            return false;
        }

        if (this.pack.rawFiles.length == 0) {
            this.message = "Please upload raw files.";
            return false;
        }

        if (!this.pack.setFile) {
            this.message = "Please upload a .visualz file.";
            return false;
        }

        if (!this.pack.mp4File) {
            this.message = "Please upload a .mp4 file.";
            return false;
        }
        this.message = '';
    }

    submitApiRequest(): any {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let params = 'pack=' + JSON.stringify(this.pack);
            xhr.open('POST', environment.ioUrl + 'api/submitVjPack', true);
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

    submit() {
        console.log('submit VJ set');
        this.validate();
        if (this.message == '') {
            this.button = "Submitting...";
            console.log(this.pack);

            // delete signed request
            for (let i = 0; i < this.pack.rawFiles.length; i++) {
                delete this.pack.rawFiles[i].signedRequest;
            }

            delete this.pack.setFile.signedRequest;
            delete this.pack.mp4File.signedRequest;

            this.submitApiRequest().then((res) => {
                console.log('DELTA', res);
                this.message = "Your VJ pack has been submitted for approval.";
                this.mixpanelService.track('VJ Pack Submission');
                this.dialogRef.close();
                this.button = "Submit";
                this.message = "";
                this._snackBar.open('VJ Pack Added', 'OK', {
                    duration: 2000,
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    panelClass: ['green-snackbar']
                });

            }, (err) => {
                this.message = "Error submitting.";
                this.button = "Submit";
            });
        }
    }
}
