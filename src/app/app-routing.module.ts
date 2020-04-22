import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// import { UploadComponent } from './upload/upload.component';
// import { TestComponent } from './test/test.component';
import { NewMovieComponent } from './new-movie/new-movie.component';
// import { FilterComponent } from './filter/filter.component';

import { VisualzComponent } from './visualz/visualz.component';
import { SupportComponent } from './support/support.component';
import { AboutComponent } from './about/about.component';
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
import { WelcomeComponent } from './welcome/welcome.component';
import { ProfileComponent } from './profile/profile.component';
import { RemoteScreenComponent } from './remote-screen/remote-screen.component';
import { LiveStreamComponent } from './live-stream/live-stream.component';
import { StreamStartComponent } from './stream-start/stream-start.component';
import { VideoLibraryComponent } from './video-library/video-library.component';
import { AuthGuard } from './auth.guard';
import { Mp4ConverterComponent } from './mp4-converter/mp4-converter.component';
import { UserGuideComponent } from './user-guide/user-guide.component';

const routes: Routes = [
    { path: '', component: VisualzComponent },
    { path: 'support', component: SupportComponent },
    { path: 'about', component: AboutComponent },
    { path: 'prices', component: BuyComponent },
    { path: 'success', component: SuccessComponent },
    { path: 'canceled', component: CanceledComponent },
    { path: 'download', component: DownloadComponent },
    { path: 'how-it-works', component: HowComponent },
    { path: 'terms-conditions', component: TermsComponent },
    { path: 'privacy-policy', component: PrivacyComponent },
    { path: 'update', component: DownloadComponent },
    { path: 'book', component: BookComponent },
    { path: 'resources', component: ResourcesComponent },
    { path: 'crowdcam/:mid', component: FanCamComponent },
    { path: 'crowdscreen/:mid', component: FanScreenComponent },
    { path: 'mobile-video/:mid/:pid/:sid', component: RemoteCamComponent },
    { path: 'remote-que/:mid', component: RemoteQueComponent },
    { path: 'laserz/:mid', component: LaserzComponent },
    { path: 'welcome/:v', component: WelcomeComponent },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard]
    },
    { path: 'mp4-converter', component: Mp4ConverterComponent },
    { path: 'movie', component: NewMovieComponent },
    { path: 'remote-screen/:pid/:mid/:plan', component: RemoteScreenComponent },
    { path: 'start', component: StreamStartComponent },
    { path: 'live/:key', component: LiveStreamComponent },
    { path: 'video-library', component: VideoLibraryComponent },
    { path: 'user-guide', component: UserGuideComponent }
    // { path: 'filter', component: FilterComponent },
    // { path: 'upload', component: UploadComponent },
    // { path: 'test', component: TestComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
