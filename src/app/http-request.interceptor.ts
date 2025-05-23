import { map } from 'rxjs/operators';
import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpHandlerFn,
  HttpResponse,
} from '@angular/common/http';
import { AppService } from './app.service';

export const httpRequestInterceptor: HttpInterceptorFn = (
  req,
  next: HttpHandlerFn
) => {
  const appService = inject(AppService);
  appService.showProgressBar(true);
  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse) {
        appService.showProgressBar(false);
      }
      return event;
    })
  );
};
