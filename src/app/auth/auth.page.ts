import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthResponseData, AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  form;
  isLogin = true;
  isPassReset = false;
  ispassTokenInput = false;

  isLoading = false;

  constructor(
              private authService: AuthService,
              private router: Router ,
  ) { }

  ngOnInit() {

    this.form = new FormGroup({
      email: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      username: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      password: new FormControl(null, {
        updateOn: 'blur',
        validators: []
      }),
      token: new FormControl(null, {
        updateOn: 'blur',
        validators: []
      }),
    });

  }


  authenticate(email: string, password: string, username: string) {
    console.log('info authen', username, 'and', password);


    let authObs: Observable<AuthResponseData>;
    if (this.isLogin) {
      authObs = this.authService.login(username, password);
    } else {
      authObs = this.authService.signup(email, password, username);
    }

    authObs.subscribe(resData => {
      console.log(resData);
      this.isLoading = false;
      this.router.navigateByUrl('/dashboard');
    });
}


onSubmit() {
  if (!this.form.value.password) {
    return;
  }
  const email =  this.form.value.email;
  const password =  this.form.value.password;
  const username =  this.form.value.username;

  this.authenticate(email,  password, username);

}

onSwitchAuthMode() {
  if (this.isLogin) {
    this.isLogin = false;
  } else if (!this.isLogin) {
    this.isLogin = true;
  }
}



}
