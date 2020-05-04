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

    collaborators: any = [
        {
            name: 'Beat Lab',
            type: 'HOUSE + TECHNO DJs',
            location: 'Live Stream',
            image: '../../assets/images/beatlab1.png',
            link: 'https://m.twitch.tv/beatlabchicago'
        },
        {
            name: '_bobbymack_',
            type: 'MUSIC ARTIST',
            location: 'NA',
            image: '../../assets/images/bobbymack.png',
            link: 'https://www.instagram.com/_bobbymack_/'
        },
        {
            name: 'D3SIGNER.DR3AMS',
            type: 'HIP HOP + RAP',
            location: 'NA',
            image: '../../assets/images/d3signerdr3ams.png',
            link: 'https://www.instagram.com/d3signer.dr3ams/'
        },
        {
            name: 'Desadeca',
            type: 'DJ',
            location: 'Chicago',
            image: '../../assets/images/mckinzy.jpg',
            link: 'https://www.facebook.com/djdesadeca/'
        },
        {
            name: 'dj_psoriasis',
            type: 'Artist',
            location: 'NA',
            image: '../../assets/images/psoriasis.jpg',
            link: 'https://www.instagram.com/dj_psoriasis/'
        },
        {
            name: 'friendkerrek',
            type: 'ARTIST',
            location: 'NA',
            image: '../../assets/images/friendkerrek.jpg',
            link: 'https://www.instagram.com/friendkerrek/'
        },
        {
            name: 'Gogg Doppia G',
            type: 'Dj/Beatmaker',
            location: 'Italy',
            image: '../../assets/images/gogg.jpg',
            link: 'https://www.instagram.com/gogg_doppia_g/'
        },
        {
            name: 'Johnny Nonstop',
            type: 'DJ',
            location: 'Chicago',
            image: 'https://visualz-1.s3.us-east-2.amazonaws.com/default-images/johnnynonstop.jpg',
            link: 'https://www.facebook.com/johnnynonstop/'
        },
        {
            name: 'The Kaizen Club',
            type: 'ARTISTS',
            location: 'Live Stream',
            image: '../../assets/images/kaizen.jpg',
            link: 'https://www.youtube.com/channel/UCk7yZcoQFKGUWnyvF219LLw/featured'
        },
        {
            name: 'Mike Larry Draw',
            type: 'MUSIC ARTIST',
            location: 'New York',
            image: '../../assets/images/mikelarry.jpg',
            link: 'https://www.mikelarrydraw.me/work'
        },
        {
            name: 'Mark Wolff',
            type: 'DJ',
            location: 'Chicago',
            image: 'https://visualz-1.s3.us-east-2.amazonaws.com/default-images/markwolff.jpg',
            link: 'https://soundcloud.com/markwolffmusic/'
        },
        {
            name: 'Metic Music',
            type: 'PRODUCER',
            location: 'NA',
            image: '../../assets/images/metic.png',
            link: 'https://www.instagram.com/meticmusic/'
        },
        {
            name: 'Nick Quicktactstic',
            type: 'DJ',
            location: 'Chicago',
            image: 'https://visualz-1.s3.us-east-2.amazonaws.com/default-images/nickmccoord.jpg',
            link: 'https://www.djquicktastic.com/'
        },
        {
            name: 'Only The Beat',
            type: 'EVENTS',
            location: 'Chicago',
            image: 'https://visualz-1.s3.us-east-2.amazonaws.com/default-images/otb.jpg',
            link: 'https://onlythebeat.com/'
        },
        {
            name: 'PJHASBEATS',
            type: 'MUSIC ARTIST',
            location: 'Seattle',
            image: '../../assets/images/pjhasbeats.png',
            link: 'https://www.instagram.com/pjhasbeats/'
        },
        {
            name: 'Sam White',
            type: 'DJ',
            location: 'Chicago',
            image: 'https://visualz-1.s3.us-east-2.amazonaws.com/default-images/samwhite.jpg',
            link: 'https://samwhitemusic.com/'
        },
        {
            name: 'Slippin Jimmy',
            type: 'DJ',
            location: 'Indiana',
            image: '../../assets/images/evan.jpg',
            link: 'https://www.facebook.com/SlippinJimmysHouse/'
        },
        {
            name: 'seanplaynice',
            type: 'ARTIST',
            location: 'NA',
            image: '../../assets/images/playnice.jpg',
            link: 'https://www.instagram.com/seanplaynice/'
        },
        {
            name: 'SPEIG',
            type: 'DJ',
            location: 'NA',
            image: '../../assets/images/speig.jpg',
            link: 'https://www.instagram.com/therealspeig/'
        },
        //,
        // {
        //     name: 'Tanza',
        //     type: 'DJ',
        //     location: 'Indiana',
        //     image: 'https://visualz-1.s3.us-east-2.amazonaws.com/default-images/tesh.jpg',
        //     link: 'https://www.facebook.com/SlippinJimmysHouse/'
        // },
        {
            name: 'Zack Joseph',
            type: 'DJ',
            location: 'Chicago',
            image: 'https://i1.sndcdn.com/avatars-000343177915-enbmz2-t200x200.jpg',
            link: 'https://www.facebook.com/zj2870'
        }
    ];

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
