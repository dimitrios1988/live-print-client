import { HttpInterceptorFn } from '@angular/common/http';
import { LoginService } from './login/login.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const loginService = inject(LoginService);
  if (loginService.isAuthenticated()) {
    const token = loginService.getToken();

    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  }
  return next(req);
};
