/**
 * Created by Edmundo Elizondo on 2/19/2018.
 */
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';
// 1
import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { GC_AUTH_TOKEN } from './constants';


@NgModule({
  exports: [
    // 2
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ]
})
export class GraphQLModule {
  // 3
  constructor(apollo: Apollo, httpLink: HttpLink) {

    // Set headers for authorization.
    const token = localStorage.getItem(GC_AUTH_TOKEN);
    const authorization = token ? `Bearer ${token}` : null;
    const headers = new HttpHeaders();
    headers.append('Authorization', authorization);
    // TODO: Now we should configure the authorization rules (permissions) https://www.graph.cool/docs/reference/auth/authorization-iegoo0heez/

    // 4
    const uri = 'https://api.graph.cool/simple/v1/cjdv3fspa0p8i010666pj8pif';
    const http = httpLink.create({ uri, headers });

    // 6
    apollo.create({
      link: http,
      cache: new InMemoryCache()
    });
  }
}
