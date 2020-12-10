import { Component, OnInit, ViewChild, ViewChildren, QueryList, ElementRef, HostListener } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MarketplaceDialogAddComponent } from '../marketplace-dialog-add/marketplace-dialog-add.component';
import { CartService } from '../services/cart.service';
import { environment } from '../../environments/environment';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete } from '@angular/material';

@Component({
    selector: 'app-marketplace',
    templateUrl: './marketplace.component.html',
    styleUrls: ['./marketplace.component.scss']
})

export class MarketplaceComponent implements OnInit {

    mode: any = { value: 'side' };
    hasBackdrop: any = { value: false };

    query: any = '';
    tagQuery: any = '';
    artistTagQuery: any = '';
    artistQuery: any = '';

    tags: any = [];
    filteredTags: Observable<string[]>;

    artistTags: any = [];
    filteredArtistTags: Observable<string[]>;

    artists: any = [];
    filteredArtists: Observable<string[]>;

    sets: any = [];
    filteredSets: Observable<string[]>;

    results: any = [];

    myControl1 = new FormControl();
    myControl2 = new FormControl();
    myControl3 = new FormControl();
    myControl4 = new FormControl();

    @ViewChild('input1') input1: ElementRef<HTMLInputElement>;
    @ViewChild('input2') input2: ElementRef<HTMLInputElement>;
    @ViewChild('input3') input3: ElementRef<HTMLInputElement>;
    @ViewChild('input4') input4: ElementRef<HTMLInputElement>;

    @ViewChild('auto1') matAutocomplete1: MatAutocomplete;
    @ViewChild('auto2') matAutocomplete2: MatAutocomplete;
    @ViewChild('auto3') matAutocomplete3: MatAutocomplete;
    @ViewChild('auto4') matAutocomplete4: MatAutocomplete;

    selectedSets: any = [];
    selectedTags: any = [];
    selectedArtists: any = [];
    selectedArtistTags: any = [];

    pages: any = [];

    selectable = true;
    removable = true;
    addOnBlur = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];

    @ViewChildren('videoPlayer') videos: QueryList<ElementRef>;
    videoList: any = [];

    // Infintite Scroll Detection
    // Works, but not needed
    // @HostListener("window:scroll", ["$event"]) onWindowScroll() {
    //     let pos = (document.documentElement.scrollTop || document.body.scrollTop);
    //     let max = document.documentElement.scrollHeight - window.innerHeight;
    //     if (pos == max) {
    //         console.log('MAX SCROLL');
    //     }
    // }

    constructor(private dialog: MatDialog, private cart: CartService) {

    }

    ngOnInit() {

        this.getTags()
            .then(() => {
                this.filteredTags = this.myControl1.valueChanges.pipe(
                    startWith(''),
                    map(value => this._filter(this.tags, this.selectedTags, value))
                );
            });

        this.getSets()
            .then(() => {
                this.filteredSets = this.myControl2.valueChanges.pipe(
                    startWith(''),
                    map(value => this._filter(this.sets, this.selectedSets, value))
                );
            });

        this.getArtistTags()
            .then(() => {
                this.filteredArtistTags = this.myControl3.valueChanges.pipe(
                    startWith(''),
                    map(value => this._filter(this.artistTags, this.selectedArtistTags, value))
                );
            });

        this.getArtists()
            .then(() => {
                this.filteredArtists = this.myControl4.valueChanges.pipe(
                    startWith(''),
                    map(value => this._filter(this.artists, this.selectedArtists, value))
                );
            });

        this.getResults();

    }

    // unused
    add(type, event: MatChipInputEvent): void {
        return;
        // To make sure this does not conflict with OptionSelected Event
        const input = event.input;
        const value = event.value;

        switch (type) {
            case 'tag':
                if (!this.matAutocomplete1.isOpen) {
                    this.selectedTags.push({ 'name': 'aaaa', 'id': 'bbbbb' });
                }
                this.myControl1.setValue('');
                break;
        }

        // // Add fruit only when MatAutocomplete is not open
        // // To make sure this does not conflict with OptionSelected Event
        // if (!this.matAutocomplete.isOpen) {
        //     const input = event.input;
        //     const value = event.value;

        //     // Add our fruit
        //     if ((value || '').trim()) {
        //         this.fruits.push(value.trim());
        //     }

        //     // Reset the input value
        //     if (input) {
        //         input.value = '';
        //     }

        //     this.fruitCtrl.setValue(null);
        // }
    }

    remove(type, option): void {
        console.log('REMOVE', option);
        let index;
        switch (type) {
            case 'tag':
                index = this.selectedTags.map(e => e.id).indexOf(option.id);
                if (index >= 0) {
                    this.selectedTags.splice(index, 1);
                    this.input1.nativeElement.value = '';
                    this.myControl1.setValue('');
                }
                break;
            case 'set':
                index = this.selectedSets.map(e => e.id).indexOf(option.id);
                if (index >= 0) {
                    this.selectedSets.splice(index, 1);
                    this.input2.nativeElement.value = '';
                    this.myControl2.setValue('');
                }
                break;
            case 'artistTag':
                index = this.selectedArtistTags.map(e => e.id).indexOf(option.id);
                if (index >= 0) {
                    this.selectedArtistTags.splice(index, 1);
                    this.input3.nativeElement.value = '';
                    this.myControl3.setValue('');
                }
                break;
            case 'artist':
                index = this.selectedArtists.map(e => e.id).indexOf(option.id);
                if (index >= 0) {
                    this.selectedArtists.splice(index, 1);
                    this.input4.nativeElement.value = '';
                    this.myControl4.setValue('');
                }
                break;
        }
        this.getResults();
    }

    selected(type, event: MatAutocompleteSelectedEvent): void {
        console.log('SELECTED', type, event);
        switch (type) {
            case 'tag':
                this.selectedTags.push({ 'name': event.option.viewValue, 'id': event.option.value });
                this.input1.nativeElement.value = '';
                this.myControl1.setValue('');
                this.input1.nativeElement.blur();
                break;
            case 'set':
                this.selectedSets.push({ 'name': event.option.viewValue, 'id': event.option.value });
                this.input2.nativeElement.value = '';
                this.myControl2.setValue('');
                this.input2.nativeElement.blur();
                break;
            case 'artistTag':
                this.selectedArtistTags.push({ 'name': event.option.viewValue, 'id': event.option.value });
                this.input3.nativeElement.value = '';
                this.myControl3.setValue('');
                this.input3.nativeElement.blur();
                break;
            case 'artist':
                this.selectedArtists.push({ 'name': event.option.viewValue, 'id': event.option.value });
                this.input4.nativeElement.value = '';
                this.myControl4.setValue('');
                this.input4.nativeElement.blur();
                break;
        }
        this.getResults();
    }

    private _filter(options, selectedOptions, value): string[] {
        console.log('ALPHA', value, options, selectedOptions);
        const filterValue = value.toString().toLowerCase();
        return options.filter((option) => {
            let selected: any = false;
            selectedOptions.filter((optionB) => {
                if (option.name == optionB.name) { selected = true; }
            });
            if (selected == true) {
                return false;
            }
            if (option.name.toLowerCase().includes(filterValue)) {
                return true;
            }
        });
    }

    getVideos() {
        this.videos.forEach((video: ElementRef) => {
            console.log(video.nativeElement);
        });
    }

    playVideo(i) {

    }

    toggleVideo(event: any) {
        //this.videoplayer.nativeElement.play();
    }

    openAddDialog(): void {

        const dialogRef = this.dialog.open(MarketplaceDialogAddComponent, {
            width: '600px',
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed', result);
        });
    }

    setsApiRequest(query, tags: any = false, sets: any = false, artistTags: any = false, artists: any = false): any {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            //let params = 'pack=' + JSON.stringify(this.pack);
            let queryString = '?query=' + query;

            if (tags) {
                let tagQuery = '';
                tags.map((tag) => {
                    tagQuery += tag.id + ',';
                });
                queryString += '&tags=' + tagQuery;
            }


            xhr.open('GET', environment.ioUrl + '/api/sets' + queryString, true);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const response = xhr.responseText;
                        //console.log('CHARLIE', response);
                        resolve(response);
                    }
                    else {
                        console.log('Error');
                        reject('err');
                    }
                }
            };
            xhr.send();
        });
    }

    tagsApiRequest(query): any {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            //let params = 'pack=' + JSON.stringify(this.pack);
            xhr.open('GET', environment.ioUrl + '/api/sets/tags?query=' + query, true);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const response = xhr.responseText;
                        //console.log('CHARLIE', response);
                        resolve(response);
                    }
                    else {
                        console.log('Error');
                        reject('err');
                    }
                }
            };
            xhr.send();
        });
    }

    artistTagsApiRequest(query): any {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', environment.ioUrl + '/api/artists/tags?query=' + query, true);
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
            xhr.send();
        });
    }

    artistsApiRequest(query): any {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', environment.ioUrl + '/api/artists?query=' + query, true);
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
            xhr.send();
        });
    }

    getTags() {
        return new Promise((resolve, reject) => {
            this.tagsApiRequest(this.tagQuery).then((res) => {
                this.tags = JSON.parse(res);
                resolve();
            }, (err) => {
                console.log('err', err);
                reject(err);
            });
        });
    }

    getSets() {
        return new Promise((resolve, reject) => {
            this.setsApiRequest(this.query).then((res) => {
                this.sets = JSON.parse(res);
                resolve();
            }, (err) => {
                console.log('err', err);
                reject(err);
            });
        });
    }

    getArtistTags() {
        return new Promise((resolve, reject) => {
            this.artistTagsApiRequest(this.artistTagQuery).then((res) => {
                this.artistTags = JSON.parse(res);
                resolve();
            }, (err) => {
                console.log('err', err);
                reject(err);
            });
        });
    }

    getArtists() {
        return new Promise((resolve, reject) => {
            this.artistsApiRequest(this.artistQuery).then((res) => {
                this.artists = JSON.parse(res);
                resolve();
            }, (err) => {
                console.log('err', err);
                reject(err);
            });
        });
    }

    getResults() {
        return new Promise((resolve, reject) => {
            this.setsApiRequest(this.query, this.selectedTags, this.selectedSets, this.selectedArtistTags, this.selectedArtists).then((res) => {
                this.results = JSON.parse(res);
                this.getVideos();
                resolve();
            }, (err) => {
                console.log('err', err);
                reject(err);
            });
        });
    }

    addProduct(pack): any {
        this.cart.addProduct(pack);
    }
}
