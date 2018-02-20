import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { GraphQLModule } from './apollo.config';


import { AppComponent } from './app.component';
import { LinkItemComponent } from './link-item/link-item.component';
import { LinkListComponent } from './link-list/link-list.component';


@NgModule({
  declarations: [
    AppComponent,
    LinkItemComponent,
    LinkListComponent
  ],
  imports: [
    BrowserModule,

    // GraphQL connection
    GraphQLModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
