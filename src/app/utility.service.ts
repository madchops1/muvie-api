import { Injectable } from '@angular/core';
import QRCode from 'qrcode';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UtilityService {

    public devFonts = [
        {
            family: "Fira Sans Compressed",
            italic: true,
            monospace: false,
            path: "/Users/madchops/Library/Fonts/FiraSansCompressed-BoldItalic.otf",
            postscriptName: "FiraSansCompressed-BoldItalic",
            style: "Bold Italic",
            weight: 700,
            width: 3
        }
    ];

    constructor() { }

    getFileType(filePath): any {
        return filePath.replace(/\?.+/, '').split('.').pop().toLowerCase();
    }

    getFileName(filePath): any {
        filePath = String(filePath);
        let n = filePath.lastIndexOf('/');
        let fileName = filePath.substring(n + 1).split('.')[0].toLowerCase();
        console.log('getFileName: name', fileName);
        return fileName;
    }

    formatPhoneList(list): any {
        //console.log('ALPHA', list);
        if (list) {
            let formattedList = '';
            list.forEach(number => {
                formattedList += '' + number + '\n';
            });
            return formattedList;
            //return '+6302175813\n+6309889002\n+63022675927';
            //this.formattedPhoneList = ;
        }
        return '';
    }

    swapArray(a, i, n): any {
        var b = a[i];
        a[i] = a[n];
        a[n] = b;
        return a;
    }

    getElementWidthHeight(id) {
        let element = document.getElementById(id);
        let positionInfo = element.getBoundingClientRect();
        let height = positionInfo.height;
        let width = positionInfo.width;
        return { width: width, height: height };
    }

    compareVersion(v1, v2) {
        if (typeof v1 !== 'string') return false;
        if (typeof v2 !== 'string') return false;
        v1 = v1.split('.');
        v2 = v2.split('.');
        const k = Math.min(v1.length, v2.length);
        for (let i = 0; i < k; ++i) {
            v1[i] = parseInt(v1[i], 10);
            v2[i] = parseInt(v2[i], 10);
            if (v1[i] > v2[i]) return 1;
            if (v1[i] < v2[i]) return -1;
        }
        return v1.length == v2.length ? 0 : (v1.length < v2.length ? -1 : 1);
    }

    errorCallback(e): any {
        console.log('Error', e);
    }

    componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    rgbToHex(r, g, b) {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }

    hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    getPercentage(value, whole) {
        if (value == 0) { return 0; } // for performance
        return whole * value / 100;
    }

    capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    getRandomElementArray(arr): any {
        let item = arr[Math.floor(Math.random() * arr.length)];
        return item;
    }

    generateSetname(): any {
        let first = [
            'Ambidextrous',

            'Bikini',

            'Front',
            'Back',
            'Top',
            'Bottom',
            'Side',

            'Little',
            'Big',
            'large',
            'Small',

            'Red',
            'Green',
            'Blue',
            'Yellow',
            'Apricot',
            'Puke Green',
            'Pink',
            'Purple',
            'Orange'
        ];
        let second = [
            'Monkey',
            'Fire',
            'Burrito',
            'Ship',
            'Car',
            'Boat',
            'Train',
            'Ufo',

            'Suit',
            'Jacket',
            'Vest',
            'Pants',
            'Bandana',

            'Up',
            'Down',
            'North',
            'East',
            'West',
            'South',

            'Alabaster',
            'Taco',
            'Burrito',

            'Brother',
            'Sister',
            'Father',
            'Mother',
            'Uncle',
            'Aunt',

            'Alien',
            'Ghost',
            'Bigfoot',
            'Sasquatch',
            'Chupacabra',
            'Mermaid',
            'Mothman'
        ];
        return this.getRandomElementArray(first) + ' ' + this.getRandomElementArray(second);
    }

    generateFourDigitKey(alpha = false): any {
        if (alpha) {
            return 'V' + Math.floor(1000 + Math.random() * 9000);
        }
        return Math.floor(1000 + Math.random() * 9000);
    }

    generateEightDigitKey(): any {
        return Math.floor(100000000 + Math.random() * 900000000);
    }

    generateHexColor(): any {
        return "#" + Math.random().toString(16).slice(2, 8);
    }

    generateQR(type, mid, pid = false, uid = false): any {
        return new Promise((resolve, reject) => {

            let url = '';
            switch (type) {

                // FanCam URL
                case 'fancam':
                    url = environment.websiteUrl + '/crowdscreen/' + mid;
                    break;

                case 'mobile-video':
                    url = environment.websiteUrl + '/mobile-video/' + mid + '/' + pid + '/' + uid;
                    break;

                // Remote Control URL
                case 'remote-que':
                    url = environment.websiteUrl + '/remote-que/' + mid;
                    break;

                case 'remote-screen':
                    url = environment.websiteUrl + '/remote-screen/' + String(pid) + '/' + mid;
                    break;

            }

            // Get QR code
            QRCode.toDataURL(url)
                .then(dataUrl => {
                    resolve(dataUrl);
                    return;
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                    return;
                });
        });
    }

    randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    randomInt(min, max) {
        return Math.floor(min + Math.random() * (max - min + 1));
    }

    map(value, min1, max1, min2, max2) {
        return this.lerp(this.norm(value, min1, max1), min2, max2);
    }

    lerp(value, min, max) {
        return min + (max - min) * value;
    }

    norm(value, min, max) {
        return (value - min) / (max - min);
    }

    shuffle(o) {
        for (var j, x, i = o.length; i; j = Math.random() * i, x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }

    clamp(value, min, max) {
        return Math.max(Math.min(value, max), min);
    }

    //function clamp(num, min, max) {
    //    return num <= min ? min : num >= max ? max : num;
    //}

    gcd(a, b) {
        return (b == 0) ? a : this.gcd(b, a % b);
    }

    calcPreviewSize(aw, ah, w1, h1) {

        let w, h;

        console.log(aw, ah, w1, h1);

        // Try height
        w = w1;
        h = w1 * ah / aw;

        console.log('Height', w, h);

        // If height greater than prevew area then
        if (h > h1) {
            h = h1;
            w = h1 * aw / ah;
            console.log('Width', w, h);
        }

        return { w: w, h: h };
    }

}
