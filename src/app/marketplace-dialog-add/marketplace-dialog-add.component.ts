import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../auth/auth.service';

export interface DialogData {
    pack: any;
}

@Component({
    selector: 'app-marketplace-dialog-add',
    templateUrl: './marketplace-dialog-add.component.html',
    styleUrls: ['./marketplace-dialog-add.component.scss']
})

export class MarketplaceDialogAddComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<MarketplaceDialogAddComponent>,
        private auth: AuthService,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

    onNoClick(): void {
        this.dialogRef.close();

    }

    ngOnInit() {
        console.log('ngOnInit', this.auth);

    }

    uploadRawFiles(event) {
        const files = event.target.files;
        console.log('FILES', files);
        //const files = document.getElementById('file-input').files;

        // const file = files[0];
        // if (file == null) {
        //     return alert('No file selected.');
        // }
        // this.getSignedRequest(file);
    }

    uploadSetFile(event) {

    }

    uploadRawFile(event) {

    }

    getSignedRequest(file): any {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `api/sign-s3?file-name=${file.name}&file-type=${file.type}`);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    this.uploadFile(file, response.signedRequest, response.url);
                }
                else {
                    alert('Could not get signed URL.');
                }
            }
        };
        xhr.send();
    }

    uploadFile(file, signedRequest, url): any {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signedRequest);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    alert('Uploaded.');
                    //document.getElementById('preview').src = url;
                    //document.getElementById('avatar-url').value = url;
                }
                else {
                    alert('Could not upload file.');
                }
            }
        };
        xhr.send(file);
    }

    submit() {
        console.log('submit VJ set');

    }

}
