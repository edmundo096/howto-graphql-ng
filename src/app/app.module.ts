import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { GraphQLModule } from './apollo.config';
import { AppRoutingModule } from './app.routing';


import { AppComponent } from './app.component';
import { LinkItemComponent } from './link-item/link-item.component';
import { LinkListComponent } from './link-list/link-list.component';
import { CreateLinkComponent } from './create-link/create-link.component';
// import { HeaderComponent } from './header/header.component';


@NgModule({
  declarations: [
    AppComponent,
    LinkItemComponent,
    LinkListComponent,
    CreateLinkComponent,
    // HeaderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,

    // GraphQL connection
    GraphQLModule,

    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
