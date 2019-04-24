import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpParams, HttpRequest, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { UploadService } from './upload.service';

@Component({
    selector: 'app-upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

    constructor(private upload: UploadService) { }

    ngOnInit() {
    }

    // At the file input element
    selectFile(event) {
        const files = event.target.files;
        //const files = document.getElementById('file-input').files;
        const file = files[0];
        if (file == null) {
            return alert('No file selected.');
        }
        this.getSignedRequest(file);
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

    /*
      uploadFile(files: FileList) {
        if (files.length == 0) {
          console.log("No file selected!");
          return
    
        }
        let file: File = files[0];
    
        this.upload.uploadFile("/api/upload", file)
          .subscribe(
            event => {
              if (event.type == HttpEventType.UploadProgress) {
                const percentDone = Math.round(100 * event.loaded / event.total);
                console.log(`File is ${percentDone}% loaded.`);
              } else if (event instanceof HttpResponse) {
                console.log('File is completely loaded!');
              }
            },
            (err) => {
              console.log("Upload Error:", err);
            }, () => {
              console.log("Upload done");
            }
          )
      }
    */
}
