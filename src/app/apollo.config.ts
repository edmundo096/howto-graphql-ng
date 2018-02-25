/**
 * Created by Edmundo Elizondo on 2/19/2018.
 */
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { getOperationAST } from 'graphql';
import { WebSocketLink } from 'apollo-link-ws';
import { ApolloLink } from 'apollo-link';

import { GC_AUTH_TOKEN } from './constants';


@NgModule({
  exports: [
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ]
})
export class GraphQLModule {

  constructor(apollo: Apollo, httpLink: HttpLink) {
    // Set headers for authorization.
    const token = localStorage.getItem(GC_AUTH_TOKEN);
    const authorization = token ? `Bearer ${token}` : null;
    const headers = new HttpHeaders();
    headers.append('Authorization', authorization);
    // TODO: Now we should configure the authorization rules (permissions) https://www.graph.cool/docs/reference/auth/authorization-iegoo0heez/

    const uri = 'https://api.graph.cool/simple/v1/cjdv3fspa0p8i010666pj8pif';
    const http = httpLink.create({ uri, headers });

    // 1
    const ws = new WebSocketLink({
      uri: `wss://subscriptions.us-west-2.graph.cool/v1/cjdv3fspa0p8i010666pj8pif`,
      options: {
        reconnect: true,
        connectionParams: {
          authToken: localStorage.getItem(GC_AUTH_TOKEN),
        }
      }
    });

    apollo.create({
      // 2
      link: ApolloLink.split(
        // 3
        operation => {
          const operationAST = getOperationAST(operation.query, operation.operationName);
          return !!operationAST && operationAST.operation === 'subscription';
        },
        ws,
        http,
      ),
      cache: new InMemoryCache()
    });
  }

}
