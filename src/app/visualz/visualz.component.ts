import { Component, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser'

@Component({
    selector: 'app-visualz',
    templateUrl: './visualz.component.html',
    styleUrls: ['./visualz.component.scss']
})
export class VisualzComponent implements OnInit {

    deviceInfo: any;
    htmlScript: any = '';

    constructor(private deviceService: DeviceDetectorService, private sanitizer: DomSanitizer) {

    }

    ngOnInit() {
        this.deviceInfo = this.deviceService.getDeviceInfo();
        console.log('deviceInfo', this.deviceInfo);

        // For disqus
        //         this.htmlScript = this.sanitizer.bypassSecurityTrustHtml(`
        //       <script>

        //     /**
        //     *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
        //     *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables*/
        //     /*
        //     var disqus_config = function () {
        //     this.page.url = PAGE_URL;  // Replace PAGE_URL with your page's canonical URL variable
        //     this.page.identifier = PAGE_IDENTIFIER; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
        //     };
        //     */
        //     (function () { // DON'T EDIT BELOW THIS LINE
        //         var d = document, s = d.createElement('script');
        //         s.src = 'https://visualz.disqus.com/embed.js';
        //         s.setAttribute('data-timestamp', +new Date());
        //         (d.head || d.body).appendChild(s);
        //     })();
        // </script>
        //     < noscript > Please enable JavaScript to view the < a href = "https://disqus.com/?ref_noscript" > comments powered by
        // Disqus.< /a></noscript >`);

        //         const fragment = document.createRange().createContextualFragment(this.htmlScript);
        //         document.body.appendChild(fragment);
    }


    downloadMac(): any {
        console.log('DOWNLOAD MAC CLICKED');
        //https://kzp2cqupt6.execute-api.us-east-2.amazonaws.com/default/visualzEventEmail
        //this.$gaService.event('download_windows', 'download_page', 'Download Windows');

        //return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        //this.mid = mid;
        let params = 'msg=VISUALZ download for Mac from www.visualzstudio.com';
        xhr.open('POST', 'https://kzp2cqupt6.execute-api.us-east-2.amazonaws.com/default/visualzEventEmail', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = xhr.responseText;
                    //resolve(response);
                    console.log('EMAIL EVENT RESPONSE: ', response);
                }
                else {
                    console.log('Error');
                    //reject('err');
                }
            }
        };
        xhr.send(params);
        //});

    }


    downloadWindows(): any {
        console.log('DOWNLOAD WINDOWS CLICKED');
        //https://kzp2cqupt6.execute-api.us-east-2.amazonaws.com/default/visualzEventEmail
        //this.$gaService.event('download_windows', 'download_page', 'Download Windows');

        //return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        //this.mid = mid;
        let params = 'msg=VISUALZ download for Windows from www.visualzstudio.com';
        xhr.open('POST', 'https://kzp2cqupt6.execute-api.us-east-2.amazonaws.com/default/visualzEventEmail', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = xhr.responseText;
                    //resolve(response);
                    console.log('EMAIL EVENT RESPONSE: ', response);
                }
                else {
                    console.log('Error');
                    //reject('err');
                }
            }
        };
        xhr.send(params);
        //});

    }


}
