import { Component, OnDestroy, OnInit } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Link } from '../types';

import {
  ALL_LINKS_QUERY, AllLinkQueryResponse, NEW_LINKS_SUBSCRIPTION, NEW_VOTES_SUBSCRIPTION, NewLinkSubcriptionResponse,
  NewVoteSubcriptionResponse
} from '../graphql';

import { Subscription } from 'rxjs/Subscription';
import { distinctUntilChanged } from 'rxjs/operators';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-link-list',
  templateUrl: './link-list.component.html',
  styleUrls: ['./link-list.component.css']
})
export class LinkListComponent implements OnInit, OnDestroy {

  allLinks: Link[] = [];
  loading: boolean = true;

  logged: boolean = false;
  subscriptions: Subscription[] = [];

  constructor(private apollo: Apollo, private authService: AuthService) { }

  ngOnInit() {

    this.authService.isAuthenticated
      .pipe(distinctUntilChanged())
      .subscribe(isAuthenticated => {
        this.logged = isAuthenticated
      });

    // Self NOTE: apollo-angular@1.0.0 Replaces "ApolloQueryObservable" with "QueryRef"
    const allLinkQuery: QueryRef<AllLinkQueryResponse> = this.apollo.watchQuery<AllLinkQueryResponse>({
      query: ALL_LINKS_QUERY
    });


    // Self NOTE: a bit complicated, outdated explanation: https://www.howtographql.com/angular-apollo/8-subscriptions/
    // A bit more complete detail on the tutorial src: https://github.com/howtographql/angular-apollo/blob/master/src/app/link-list/link-list.component.ts
    allLinkQuery
      .subscribeToMore({    // will open up a WebSocket connection to the subscription server
        document: NEW_LINKS_SUBSCRIPTION,
        updateQuery: (previous: AllLinkQueryResponse, { subscriptionData }) => {
          const newAllLinks: Link[] = [
            (<NewLinkSubcriptionResponse>subscriptionData.data.Link).node,
            ...previous.allLinks
          ];
          return {
            ...previous,
            allLinks: newAllLinks
          }
        }
      });

    allLinkQuery
      .subscribeToMore({
        document: NEW_VOTES_SUBSCRIPTION,
        updateQuery: (previous: AllLinkQueryResponse, { subscriptionData }) => {
          const votedLinkIndex = previous.allLinks.findIndex(link =>
            link.id === (<NewVoteSubcriptionResponse>subscriptionData.data.Vote).node.link.id
          );
          const link = (<NewVoteSubcriptionResponse>subscriptionData.data.Vote).node.link;

          const newAllLinks = previous.allLinks.slice();
          newAllLinks[votedLinkIndex] = link;

          return {
            ...previous,
            allLinks: newAllLinks
          }
        }
      });

    const querySubscription = allLinkQuery.valueChanges.subscribe((response) => {
      this.allLinks = response.data.allLinks;
      // Self NOTE: The tutorial had "response.data.loading;" but seems the real "loading" should come from Apollo response type.
      this.loading = response.loading;
    });

    this.subscriptions = [...this.subscriptions, querySubscription];

  }

  ngOnDestroy(): void {
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }

  updateStoreAfterVote (store, createVote, linkId) {
    // 1
    const data = store.readQuery({
      query: ALL_LINKS_QUERY
    });

    // 2
    const votedLink = data.allLinks.find(link => link.id === linkId);
    votedLink.votes = createVote.link.votes;  // createVote was returned by the server.

    // 3. take the modified data and write it back into the store.
    store.writeQuery({ query: ALL_LINKS_QUERY, data })
  }

}
