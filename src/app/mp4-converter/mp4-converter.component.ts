import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-mp4-converter',
    templateUrl: './mp4-converter.component.html',
    styleUrls: ['./mp4-converter.component.scss']
})
export class Mp4ConverterComponent implements OnInit {

    file: any = "";
    uploading: any = false;
    finalFile: any = false;

    constructor() { }

    ngOnInit() {
    }

    convert(): any {
        this.uploading = true;
        let data = {
            'file-name': this.file,
            'set-name': 'conversion',
            'mid': 'website',
            'bucket': 'muvievideos'
        };
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `/api/gifToMp4`, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    console.log('success', response.fileName); // HERE BOY
                    this.finalFile = response.fileName;
                    this.uploading = false;
                }
                else {
                    alert('Could not get signed URL.');
                    this.uploading = false;
                }
            }
        }

        xhr.send(JSON.stringify(data));
    }

    startUpload(event): any {
        this.uploading = true;
        //console.log('uploadAudioFile');
        const files = event.target.files;
        const file = files[0];
        if (file == null) {
            return alert('No file selected.');
        }
        this.getSignedRequest(file);
    }

    getSignedRequest(file): any {
        console.log('FILE', file);
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `/api/sign-s3?file-name=${file.name}&file-type=${file.type}`);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    this.uploadFile(file, response.signedRequest, response.url, file.type);
                }
                else {
                    alert('Could not get signed URL.');
                    this.uploading = false;
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
                    let s = xhr.responseURL
                    s = s.substring(0, s.indexOf('?'));
                    this.file = s;
                    this.uploading = false;
                    console.log('Uploaded.', this.file);
                }
                else {
                    alert('Could not upload file.');
                    this.uploading = false;
                }
            }
        };
        xhr.send(file);
    }
}
