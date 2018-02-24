import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';

import { Link } from '../types';
import { timeDifferenceForDate } from '../utils';

import { CREATE_VOTE_MUTATION, CreateVoteMutationResponse } from '../graphql';
import { GC_USER_ID } from '../constants';

@Component({
  selector: 'app-link-item',
  templateUrl: './link-item.component.html',
  styleUrls: ['./link-item.component.css']
})
export class LinkItemComponent implements OnInit, OnDestroy {

  @Input()
  link: Link;

  @Input()
  index: number = 8;

  @Input()
  isAuthenticated: boolean = false;

  subscriptions: Subscription[] = [];


  constructor(private apollo: Apollo) { }

  ngOnInit() {
  }

  voteForLink() {
    const userId = localStorage.getItem(GC_USER_ID);

    // Check if already voted.
    const voterIds = this.link.votes.map(vote => vote.user.id);
    if (voterIds.includes(userId)) {
      alert(`User (${userId}) already voted for this link.`);
      return
    }

    const linkId = this.link.id;

    const mutationSubscription = this.apollo.mutate<CreateVoteMutationResponse>({
        mutation: CREATE_VOTE_MUTATION,
        variables: {
          userId,
          linkId
        }
      })
      .subscribe();

    this.subscriptions = [...this.subscriptions, mutationSubscription];
  }

  humanizeDate(date: string) {
    return timeDifferenceForDate(date);
  }

  ngOnDestroy(): void {
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }

}
