/**
 * Created by Edmundo Elizondo on 2/19/2018.
 */
import { Link, User, Vote } from './types';
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
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
`;

// 3
export interface AllLinkQueryResponse {
  allLinks: Link[];
  // loading: boolean;  // Self NOTE: on tutorial seems that this was from an old version.
}



// 1
export const CREATE_LINK_MUTATION = gql`
  # 2
#  Self NOTE: Graphcool generates for creations a "postedBy" (with an User) and a "postedById" (with an User ID)
  mutation CreateLinkMutation($description: String!, $url: String!, $postedById: ID!) {
    createLink(
      description: $description,
      url: $url,
      postedById: $postedById
    ) {
      id
      createdAt
      url
      description
      postedBy {
        id
        name
      }
    }
  }
`;

//3
export interface CreateLinkMutationResponse {
  createLink: Link;
  // loading: boolean;
}



export const CREATE_USER_MUTATION = gql`
  mutation CreateUserMutation($name: String!, $email: String!, $password: String!) {
#    NOTE: seems to be outdated on the tutorial, it didn't used the template ones. So we used it below.
#    UPDATED NOTE: The "createUser" and "signinUser" are created only when creating the prohect on the WEB CONSOLE Only as an Auth provider! (probably this tutorial is incomplete vs others using it).
    
#    createUser(
#      name: $name,
#      authProvider: {
#        email: {
#          email: $email,
#          password: $password
#        }
#      }
#    ) {
#      id
#    }
#
#    signinUser(email: {
#      email: $email,
#      password: $password
#    }) {
#      token
#      user {
#        id
#      }
#    }

#    This one has email validation and stuff. Still we should modify it to return a User type and we would query the id here.
    signupUser(email: $email, password: $password, name: $name) {
      id
      token
    }
  }
`;

export interface CreateUserMutationResponse {
  // Tutorial original structure:
  // loading: boolean;
  // createUser: User;
  // signinUser: {
  //   token: string,
  //   user?: User
  // };
  signupUser: {
    id: string
    token: string
  }
}

export const SIGNIN_USER_MUTATION = gql`
  mutation SigninUserMutation($email: String!, $password: String!) {
#    Same as above...:
#    signinUser(email: {
#      email: $email,
#      password: $password
#    }) {
#      token
#      user {
#        id
#      }
#    }

    authenticateUser(email: $email, password: $password) {
      id
      token
    }
  }
`;


export interface SigninUserMutationResponse {
  // loading: boolean;
  // signinUser: {
  //   token: string,
  //   user?: User
  // };

  authenticateUser: {
    id: string
    token: string
  }
}


export const CREATE_VOTE_MUTATION = gql`
  mutation CreateVoteMutation($userId: ID!, $linkId: ID!) {
    createVote(userId: $userId, linkId: $linkId) {
      id
      link {
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`;

export interface CreateVoteMutationResponse {
  // loading: boolean;
  createVote: {
    id: string;
    link: Link;
    user: User;
  };
}


export const ALL_LINKS_SEARCH_QUERY = gql`
  query AllLinksSearchQuery($searchText: String!) {
    allLinks(
      filter: {
        OR: [
          {url_contains: $searchText},
          {description_contains: $searchText}
        ]
      }
    ) {
      id
      url
      description
      createdAt
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
`;

export interface AllLinksSearchQueryResponse {
  loading: boolean;
  allLinks: Link[];
}


export const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    Link(
      filter: {
        mutation_in: [CREATED]
      }
    ) {
      node {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`;

export interface NewLinkSubcriptionResponse {
  node: Link;
}


export const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    Vote(
      filter: {
        mutation_in: [CREATED]
      }
    ) {
      node {
        id
        link {
          id
          url
          description
          createdAt
          postedBy {
            id
            name
          }
          votes {
            id
            user {
              id
            }
          }
        }
        user {
          id
        }
      }
    }
  }
`;

export interface NewVoteSubcriptionResponse {
  node: Vote;
}
