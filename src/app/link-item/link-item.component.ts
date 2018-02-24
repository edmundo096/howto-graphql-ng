import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Link } from '../types';
import { timeDifferenceForDate } from '../utils';

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


  constructor() { }

  ngOnInit() {
  }

  voteForLink= async () => {
    // ... you'll implement this in chapter 6
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
