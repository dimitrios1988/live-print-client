import { HttpInterceptorFn } from '@angular/common/http';
import { LoginService } from './login/login.service';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const loginService = inject(LoginService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Call the logout function
        loginService.logout();
      }
      return throwError(() => error);
    })
  );
};
