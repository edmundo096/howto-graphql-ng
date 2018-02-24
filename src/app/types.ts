/**
 * Created by Edmundo Elizondo on 2/19/2018.
 */
export class Link {
  id?: string;
  description?: string;
  url?: string;

  createdAt?: string;
  postedBy?: User;
  votes?: Vote[];
}

// NOTE: Seems to not be mentioned on the tutorial but is needed.
export class User {
  id?: string;

  name?: string;
  email?: string;
  votes?: Vote[];
}

export class Vote {
  id?: string;
  user?: User;
  link?: Link;
}
