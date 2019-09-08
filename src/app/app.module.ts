import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule, MatIconModule, MatButtonModule, MatTooltipModule, MatToolbarModule, MatButtonToggleModule, MatSidenavModule, MatRadioModule, MatCheckboxModule, MatSliderModule, MatCardModule, MatGridListModule, MatProgressSpinnerModule, MatToolbar } from '@angular/material';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
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
import { FanCamComponent } from './fan-cam/fan-cam.component';
import { FanScreenComponent } from './fan-screen/fan-screen.component';
import { RemoteCamComponent } from './remote-cam/remote-cam.component';
import { RemoteQueComponent } from './remote-que/remote-que.component';
import { LaserzComponent } from './laserz/laserz.component';
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
        FanCamComponent,
        FanScreenComponent,
        RemoteCamComponent,
        RemoteQueComponent,
        LaserzComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatMenuModule,
        MatToolbarModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatSliderModule,
        MatCardModule,
        MatGridListModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatSidenavModule,
        MatIconModule,
        MatSlideToggleModule,
        MatTooltipModule,
        HttpClientModule,
        FontAwesomeModule,
        NgxAudioPlayerModule,
        DragDropModule,
        SocketIoModule.forRoot(config),
        FormsModule
    ],
    providers: [
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
