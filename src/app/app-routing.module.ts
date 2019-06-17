import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
//import { UploadComponent } from './upload/upload.component';
//import { TestComponent } from './test/test.component';
//import { NewMovieComponent } from './new-movie/new-movie.component';
//import { FilterComponent } from './filter/filter.component';
import { VisualzComponent } from './visualz/visualz.component';
import { SupportComponent } from './support/support.component';
import { BuyComponent } from './buy/buy.component';
import { SuccessComponent } from './success/success.component';
import { CanceledComponent } from './canceled/canceled.component';
import { DownloadComponent } from './download/download.component';
import { HowComponent } from './how/how.component';

const routes: Routes = [
    { path: '', component: VisualzComponent },
    { path: 'support', component: SupportComponent },
    { path: 'prices', component: BuyComponent },
    { path: 'success', component: SuccessComponent },
    { path: 'canceled', component: CanceledComponent },
    { path: 'download', component: DownloadComponent },
    { path: 'how-it-works', component: HowComponent },
    //{ path: 'movie', component: NewMovieComponent },
    //{ path: 'filter', component: FilterComponent },
    //{ path: 'upload', component: UploadComponent },
    //{ path: 'test', component: TestComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
