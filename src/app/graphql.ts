/**
 * Created by Edmundo Elizondo on 2/19/2018.
 */
import { Link, User } from './types';
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



// 1
export const CREATE_LINK_MUTATION = gql`
  # 2
  mutation CreateLinkMutation($description: String!, $url: String!) {
    createLink(
      description: $description,
      url: $url,
    ) {
      id
      createdAt
      url
      description
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
