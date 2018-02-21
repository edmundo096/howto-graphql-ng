import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';

import { GC_USER_ID, GC_AUTH_TOKEN } from '../constants';
import { AuthService } from '../auth.service';
import {
  CREATE_USER_MUTATION, CreateUserMutationResponse, SIGNIN_USER_MUTATION, SigninUserMutationResponse
} from '../graphql';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  login: boolean = true; // switch between Login and SignUp
  email: string = '';
  password: string = '';
  name: string = '';

  constructor(private router: Router,
              private authService: AuthService,
              private apollo: Apollo) { }

  ngOnInit() {
  }

  confirm() {
    if (this.login) {
      this.apollo.mutate<SigninUserMutationResponse>({
        mutation: SIGNIN_USER_MUTATION,
        variables: {
          email: this.email,
          password: this.password
        }
      }).subscribe((result) => {
        // Tutorial original structure:
        // const id = result.data.signinUser.user.id;
        // const token = result.data.signinUser.token;
        const id = result.data.authenticateUser.id;
        const token = result.data.authenticateUser.token;

        this.saveUserData(id, token);

        this.router.navigate(['/']);

      }, (error) => {
        alert(error)
      });
    }
    else {
      this.apollo.mutate<CreateUserMutationResponse>({
        mutation: CREATE_USER_MUTATION,
        variables: {
          name: this.name,
          email: this.email,
          password: this.password
        }
      }).subscribe((result) => {
        // Tutorial original structure:
        // const id = result.data.signinUser.user.id;
        // const token = result.data.signinUser.token;

        const id = result.data.signupUser.id;
        const token = result.data.signupUser.token;

        this.saveUserData(id, token);

        this.router.navigate(['/']);

      }, (error) => {
        alert(error)
      })
    }
  }

  // Self NOTE: we should use the saveUserData() inside the auth service! (below is the tutorial way)
  saveUserData(id, token) {
    localStorage.setItem(GC_USER_ID, id);
    localStorage.setItem(GC_AUTH_TOKEN, token);
    this.authService.setUserId(id);
  }

}
