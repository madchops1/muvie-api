import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadComponent } from './upload/upload.component';
import { TestComponent } from './test/test.component';
import { NewMovieComponent } from './new-movie/new-movie.component';
import { FilterComponent } from './filter/filter.component';

const routes: Routes = [
    { path: '', component: NewMovieComponent },
    { path: 'filter', component: FilterComponent },
    { path: 'upload', component: UploadComponent },
    { path: 'test', component: TestComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
