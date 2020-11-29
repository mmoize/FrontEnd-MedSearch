
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanLoad, Route, UrlSegment, Router, CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { take, tap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate  {

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):  Promise<boolean>  {

    let url: string = state.url;
    const result = this.returnUserDetails();

    if (!result) {
      this.router.navigateByUrl('auth');
    }

    return result;
      // return this.authService.userIsAuthenticated.pipe(take(1),
      // switchMap(isAuthenticated => {
      //   if (!isAuthenticated) {
      //     console.log(' num 1')

      //     if (this.returnUserDetails() === null) {
      //       return of(isAuthenticated);
      //     } else {
      //       return this.authService.autoLogin();
      //     }

      //   } else {
      //     console.log(' num 2')
      //     return of(isAuthenticated);
      //   }

      // }),
      //  tap(isAuthenticated => {
      //   console.log(' num 3')
      //   if (!isAuthenticated) {
      //     console.log(' num 4')
      //     this.router.navigateByUrl('auth');
      //   }
      // }));
    }

    async returnUserDetails() {
      const value = await localStorage.getItem('authData') ;
      console.log('this is ', value);

      if (value === null) {
        this.router.navigateByUrl('auth');
        return false;
      } else {
        return true;

      }
    }

}

