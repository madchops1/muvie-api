import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatSidenavModule, MatRadioModule, MatCheckboxModule, MatSliderModule, MatCardModule, MatGridListModule, MatProgressSpinnerModule } from '@angular/material';

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
const config: SocketIoConfig = { url: 'http://localhost:' + environment.ioPort, options: {} };

@NgModule({
    declarations: [
        AppComponent,
        UploadComponent,
        TestComponent,
        NewMovieComponent,
        FilterComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatSliderModule,
        MatCardModule,
        MatGridListModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatSidenavModule,
        HttpClientModule,
        FontAwesomeModule,
        NgxAudioPlayerModule,
        DragDropModule,
        SocketIoModule.forRoot(config)
    ],
    providers: [
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
