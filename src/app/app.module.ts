import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatChipsModule, MatAutocompleteModule, MatSnackBarModule, MatBadgeModule, MatMenuModule, MatSelectModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule, MatIconModule, MatButtonModule, MatTooltipModule, MatToolbarModule, MatButtonToggleModule, MatSidenavModule, MatRadioModule, MatCheckboxModule, MatSliderModule, MatCardModule, MatGridListModule, MatProgressSpinnerModule, MatToolbar, MatSelect, MatDialogModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { DeviceDetectorModule } from 'ngx-device-detector';

import { AppComponent } from './app.component';
import { UploadComponent } from './upload/upload.component';
import { TestComponent } from './test/test.component';
import { NewMovieComponent } from './new-movie/new-movie.component';
import { HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxAudioPlayerModule } from 'ngx-audio-player';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from '../environments/environment';
import { FilterComponent } from './filter/filter.component';
import { VisualzComponent } from './visualz/visualz.component';
import { SupportComponent } from './support/support.component';
import { BuyComponent } from './buy/buy.component';
import { SuccessComponent } from './success/success.component';
import { CanceledComponent } from './canceled/canceled.component';
import { DownloadComponent } from './download/download.component';
import { HowComponent } from './how/how.component';
import { TermsComponent } from './terms/terms.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { BookComponent } from './book/book.component';
import { ResourcesComponent } from './resources/resources.component';
import { FanScreenComponent } from './fan-screen/fan-screen.component';
import { RemoteCamComponent } from './remote-cam/remote-cam.component';
import { RemoteQueComponent } from './remote-que/remote-que.component';
import { LaserzComponent } from './laserz/laserz.component';
import { HtwComponent } from './htw/htw.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { ProfileComponent } from './profile/profile.component';
import { Mp4ConverterComponent } from './mp4-converter/mp4-converter.component';
import { RemoteScreenComponent } from './remote-screen/remote-screen.component';
import { LiveStreamComponent } from './live-stream/live-stream.component';
import { StreamStartComponent } from './stream-start/stream-start.component';
import { GridsterModule } from 'angular-gridster2';
import { AboutComponent } from './about/about.component';
import { VideoLibraryComponent } from './video-library/video-library.component';
import { UserGuideComponent } from './user-guide/user-guide.component';
import { HowAComponent } from './how-a/how-a.component';
import { HowBComponent } from './how-b/how-b.component';
import { HowCComponent } from './how-c/how-c.component';
import { HowDComponent } from './how-d/how-d.component';
import { CalendarComponent } from './calendar/calendar.component';
import { AccountComponent } from './account/account.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';
import { MarketplaceDialogAddComponent } from './marketplace-dialog-add/marketplace-dialog-add.component';
import { TutorialsComponent } from './tutorials/tutorials.component';
import { CartComponent } from './cart/cart.component';
import { ExamplesComponent } from './examples/examples.component';
import { MarketPlaceSuccessComponent } from './market-place-success/market-place-success.component';
import { UiComponent } from './ui/ui.component';
import { VizuwearComponent } from './vizuwear/vizuwear.component';
import { CollaboratorsComponent } from './collaborators/collaborators.component';
import { MusiciansComponent } from './musicians/musicians.component';
import { ContactComponent } from './contact/contact.component';

const config: SocketIoConfig = { url: environment.ioUrl, options: { autoConnect: false } };

@NgModule({
    declarations: [
        AppComponent,
        UploadComponent,
        TestComponent,
        NewMovieComponent,
        FilterComponent,
        VisualzComponent,
        SupportComponent,
        BuyComponent,
        SuccessComponent,
        CanceledComponent,
        DownloadComponent,
        HowComponent,
        TermsComponent,
        PrivacyComponent,
        BookComponent,
        ResourcesComponent,
        FanScreenComponent,
        RemoteCamComponent,
        RemoteQueComponent,
        LaserzComponent,
        HtwComponent,
        WelcomeComponent,
        ProfileComponent,
        Mp4ConverterComponent,
        RemoteScreenComponent,
        LiveStreamComponent,
        StreamStartComponent,
        AboutComponent,
        VideoLibraryComponent,
        UserGuideComponent,
        HowAComponent,
        HowBComponent,
        HowCComponent,
        HowDComponent,
        CalendarComponent,
        AccountComponent,
        MarketplaceComponent,
        MarketplaceDialogAddComponent,
        TutorialsComponent,
        CartComponent,
        ExamplesComponent,
        MarketPlaceSuccessComponent,
        UiComponent,
        VizuwearComponent,
        CollaboratorsComponent,
        MusiciansComponent,
        ContactComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        MatMenuModule,
        MatToolbarModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatSliderModule,
        MatCardModule,
        MatGridListModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatRadioModule,
        MatSidenavModule,
        MatIconModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTooltipModule,
        GridsterModule,
        HttpClientModule,
        FontAwesomeModule,
        NgxAudioPlayerModule,
        DragDropModule,
        SocketIoModule.forRoot(config),
        FormsModule,
        ReactiveFormsModule,
        DeviceDetectorModule.forRoot()
    ],
    entryComponents: [
        MarketplaceDialogAddComponent,
    ],
    providers: [
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
