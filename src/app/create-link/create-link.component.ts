import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';

import { ALL_LINKS_QUERY, CREATE_LINK_MUTATION, CreateLinkMutationResponse } from '../graphql';
import { Router } from '@angular/router';
import { GC_USER_ID } from '../constants';

@Component({
  selector: 'app-create-link',
  templateUrl: './create-link.component.html',
  styleUrls: ['./create-link.component.css']
})
export class CreateLinkComponent implements OnInit {

  description: string = '';
  url: string = '';

  constructor(private apollo: Apollo, private router: Router) { }

  ngOnInit() {
  }

  createLink() {
    const postedById = localStorage.getItem(GC_USER_ID);
    if (!postedById) {
      console.error('No user logged in');
      return
    }

    const newDescription = this.description;
    const newUrl = this.url;
    this.description = '';
    this.url = '';

    this.apollo.mutate<CreateLinkMutationResponse>({
      mutation: CREATE_LINK_MUTATION,
      variables: {
        description: newDescription,
        url: newUrl,
        postedById
      },

      // NOTE: Tutorial doesn't explains too much about this, but here he does:
      //  https://dev-blog.apollodata.com/tutorial-graphql-mutations-optimistic-ui-and-store-updates-f7b6b66bf0e2
      //  Also note that we have "optimisticResponse" property to handle optimistic UI.
      update: (store, {data: {createLink}}) => {
        // Read the data from the cache for this query.
        const data: any = store.readQuery({
          query: ALL_LINKS_QUERY
        });

        // Add our link from the mutation to the end.
        data.allLinks.push(createLink);

        // Write the data back to the cache.
        store.writeQuery({ query: ALL_LINKS_QUERY, data })
      },
    }).subscribe((response) => {
      console.log('mutation response:', response);
      this.router.navigate(['/']);
    }, (error)=>{
      console.error(error);
      this.description = newDescription;
      this.url = newUrl;
    });
  }

}
