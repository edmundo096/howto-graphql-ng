import { Component, OnDestroy, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Link } from '../types';

// 1
import { ALL_LINKS_QUERY, AllLinkQueryResponse } from '../graphql';

import { Subscription } from 'rxjs/Subscription';
import { distinctUntilChanged } from 'rxjs/operators';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-link-list',
  templateUrl: './link-list.component.html',
  styleUrls: ['./link-list.component.css']
})
export class LinkListComponent implements OnInit, OnDestroy {
  // 2
  allLinks: Link[] = [];
  loading: boolean = true;

  logged: boolean = false;
  subscriptions: Subscription[] = [];

  // 3
  constructor(private apollo: Apollo, private authService: AuthService) { }

  ngOnInit() {

    this.authService.isAuthenticated
      .pipe(distinctUntilChanged())
      .subscribe(isAuthenticated => {
        this.logged = isAuthenticated
      });

    // 4
    const querySubscription = this.apollo.watchQuery<AllLinkQueryResponse>({
      query: ALL_LINKS_QUERY
    }).valueChanges.subscribe((response) => {
      // 5
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
