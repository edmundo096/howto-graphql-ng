import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import * as _ from 'lodash';

import {
  ALL_LINKS_QUERY, AllLinkQueryResponse, NEW_LINKS_SUBSCRIPTION, NEW_VOTES_SUBSCRIPTION, NewLinkSubcriptionResponse,
  NewVoteSubcriptionResponse
} from '../graphql';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { AuthService } from '../auth.service';
import { Link } from '../types';
import { ApolloQueryResult } from 'apollo-client';
import { LINKS_PER_PAGE } from '../constants';

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

  first$: Observable<number>;
  skip$: Observable<number>;
  orderBy$: Observable<string | null>;

  linksPerPage = LINKS_PER_PAGE;
  count = 0;

  constructor(private apollo: Apollo, private authService: AuthService, private route: ActivatedRoute,
              private router: Router) { }

  get orderedLinks(): Observable<Link[]> {
    return this.route.url.pipe(
      map((segments) => segments.toString()),
      map((path) => {
        if (path.includes('top')) {
          return _.orderBy(this.allLinks, 'votes.length').reverse();
        } else {
          return this.allLinks;
        }
      })
    );
  }

  get isFirstPage(): Observable<boolean> {
    return this.route.paramMap.pipe(
      map((params) => {
        return parseInt(params.get('page'), 10);
      }),
      map(page => page === 1)
    );
  }

  get isNewPage(): Observable<boolean> {
    return this.route.url.pipe(
      map((segments) => segments.toString()),
      map(path => path.includes('new'))
    );
  }

  get pageNumber(): Observable<number> {
    return this.route.paramMap.pipe(
      map((params) => {
        return parseInt(params.get('page'), 10);
      })
    );
  }

  get morePages(): Observable<boolean> {
    return this.pageNumber.pipe(
      map(pageNumber => pageNumber < this.count / this.linksPerPage)
    );
  }

  ngOnInit() {

    this.authService.isAuthenticated
      .pipe(distinctUntilChanged())
      .subscribe(isAuthenticated => {
        this.logged = isAuthenticated
      });

    // Begins the pagination logic:
    //   See details here: https://github.com/howtographql/howtographql/blob/master/content/frontend/angular-apollo/9-pagination.md
    // 0
    const pageParams$: Observable<number> = this.route.paramMap.pipe(
      map((params) => {
        return parseInt(params.get('page'), 10);
      })
    );

    // 1
    const path$: Observable<string> = this.route.url.pipe(
      map((segments) => segments.toString())
    );

    // 2
    this.first$ = path$.pipe(
      map((path) => {
        const isNewPage = path.includes('new');     // Self NOTE: "new" page are the latest ones, else are the "top"s ones.
        return isNewPage ? this.linksPerPage : 100;
      })
    );

    // 3
    this.skip$ = combineLatest(path$, pageParams$).pipe(
      map(([path, page]) => {
        const isNewPage = path.includes('new');
        return isNewPage ? (page - 1) * this.linksPerPage : 0;
      })
    );

    // 4
    this.orderBy$ = path$.pipe(
      map((path) => {
        const isNewPage = path.includes('new');
        return isNewPage ? 'createdAt_DESC' : null;
      })
    );

    // 5
    const getQuery = (variables): Observable<ApolloQueryResult<AllLinkQueryResponse>> => {

      // Self NOTE: apollo-angular@1.0.0 Replaces "ApolloQueryObservable" with "QueryRef"
      const query: QueryRef<AllLinkQueryResponse> = this.apollo.watchQuery<AllLinkQueryResponse>({
          query: ALL_LINKS_QUERY,
          variables
        });

      // Call .subscribeToMore on the query for NEW_LINKS_SUBSCRIPTION, NEW_VOTES_SUBSCRIPTION omitted
      LinkListComponent.addSubscribesToMoreOn(query);

      return query.valueChanges;
    };


    const allLinkQuery: Observable<ApolloQueryResult<AllLinkQueryResponse>> =
      // 6
      combineLatest(this.first$, this.skip$, this.orderBy$, (first, skip, orderBy) => ({ first, skip, orderBy }))
      // 7
      // We use switchMap to "flatten" the Observable<Observable<ApolloQueryResult<AllLinkQueryResponse>>> (if we used .map())
      // to an Observable<ApolloQueryResult<AllLinkQueryResponse>>
      .pipe( switchMap((variables: any) =>  getQuery(variables)) );

    const querySubscription = allLinkQuery.subscribe((response) => {
      this.allLinks = response.data.allLinks;
      this.count = response.data._allLinksMeta.count;
      // Self NOTE: The tutorial had "response.data.loading;" but seems the real "loading" should come from ApolloQueryResult type.
      this.loading = response.loading;
    });

    this.subscriptions = [...this.subscriptions, querySubscription];
  }

  private static addSubscribesToMoreOn(query: QueryRef<AllLinkQueryResponse>) {
    // Self NOTE: a bit complicated, outdated explanation: https://www.howtographql.com/angular-apollo/8-subscriptions/
    // A bit more complete detail on the tutorial src: https://github.com/howtographql/angular-apollo/blob/master/src/app/link-list/link-list.component.ts
    query
      .subscribeToMore({    // will open up a WebSocket connection to the subscription server
        document: NEW_LINKS_SUBSCRIPTION,
        updateQuery: (previous: AllLinkQueryResponse, {subscriptionData}) => {
          const newAllLinks: Link[] = [
            (<NewLinkSubcriptionResponse>subscriptionData.data.Link).node,
            ... previous.allLinks
          ];
          return {
            ... previous,
            allLinks: newAllLinks
          }
        }
      });

    query
      .subscribeToMore({
        document: NEW_VOTES_SUBSCRIPTION,
        updateQuery: (previous: AllLinkQueryResponse, {subscriptionData}) => {
          const votedLinkIndex = previous.allLinks.findIndex(link =>
            link.id === (<NewVoteSubcriptionResponse>subscriptionData.data.Vote).node.link.id
          );
          const link = (<NewVoteSubcriptionResponse>subscriptionData.data.Vote).node.link;

          const newAllLinks = previous.allLinks.slice();
          newAllLinks[votedLinkIndex] = link;

          return {
            ... previous,
            allLinks: newAllLinks
          }
        }
      });
  }

  ngOnDestroy(): void {
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }

  // Previous- and Next-buttons.

  nextPage() {
    const page = parseInt(this.route.snapshot.params.page, 10);
    if (page < this.count / LINKS_PER_PAGE) {
      const nextPage = page + 1;
      this.router.navigate([`/new/${nextPage}`]);
    }
  }

  previousPage() {
    const page = parseInt(this.route.snapshot.params.page, 10);
    if (page > 1) {
      const previousPage = page - 1;
      this.router.navigate([`/new/${previousPage}`]);
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
