/**
 * Created by Edmundo Elizondo on 2/19/2018.
 */
export interface Link {
  id?: string;
  description?: string;
  url?: string;
}

// NOTE: Seems to not be mentioned on the tutorial but is needed.
export interface User {
  id?: string;
}

// TODO: seems to be missing the props as the GraphQL schema types.
