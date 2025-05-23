import { HttpInterceptorFn } from '@angular/common/http';
import { LoginService } from './login/login.service';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { AppService } from './app.service';

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const loginService = inject(LoginService);
  const appService = inject(AppService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Call the logout function
        loginService.logout();
        appService.displayMessage('Λανθασμένο username/password', 3500);
      } else {
        appService.displayMessage('Αδυναμία Σύνδεσης', 3500);
      }
      appService.showProgressBar(false);
      return throwError(() => error);
    })
  );
};
