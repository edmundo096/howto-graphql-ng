/**
 * Created by Edmundo Elizondo on 2/20/2018.
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// 1
import { LinkListComponent } from './link-list/link-list.component';
import { CreateLinkComponent } from './create-link/create-link.component';
import { LoginComponent } from './login/login.component';
import { SearchComponent } from './search/search.component';

/**
 * Setup all routes here
 */
const routes: Routes = [
  // 2
  {
    path: '',
    component: LinkListComponent,
    pathMatch: 'full'
  },
  {
    path: 'create',
    component: CreateLinkComponent,
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    pathMatch: 'full'
  },
  {
    path: 'search',
    component: SearchComponent,
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '',
  }
];

@NgModule({
  imports: [
    // 3
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
