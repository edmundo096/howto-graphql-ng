/**
 * Created by Edmundo Elizondo on 2/19/2018.
 */
import {Link} from './types';
// 1
import gql from 'graphql-tag'

// 2
export const ALL_LINKS_QUERY = gql`
  query AllLinksQuery {
    allLinks {
      id
      createdAt
      url
      description
    }
  }
`;

// 3
export interface AllLinkQueryResponse {
  allLinks: Link[];
  // loading: boolean;  // Self NOTE: on tutorial seems that this was from an old version.
}
