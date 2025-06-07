import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { EMPTY, from } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { LicenseService } from './license.service';
import { ILicense } from './license.interface';
import { AppService } from '../app.service';
import { LoginService } from '../login/login.service';

export const licenseInterceptor: HttpInterceptorFn = (req, next) => {
  const licenseService = inject(LicenseService);
  const appService = inject(AppService);
  const loginService = inject(LoginService);

  return from(licenseService.verifyLicense()).pipe(
    catchError(() => {
      appService.showProgressBar(false);
      loginService.logout(); // Ensure user is logged out on license verification failure
      return EMPTY;
    }), // Catch errors and block the request
    switchMap((license: ILicense | null) => {
      if (license) {
        return next(req);
      } else {
        appService.showProgressBar(false);
        return EMPTY;
      }
    })
  );
};
