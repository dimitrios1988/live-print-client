import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { unauthorizedInterceptor } from './unauthorized.interceptor';
import { httpRequestInterceptor } from './http-request.interceptor';
import { licenseInterceptor } from './license-registration/license.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(withXhr(), 
      withInterceptors([
        authInterceptor,
        unauthorizedInterceptor,
        httpRequestInterceptor,
        licenseInterceptor,
      ]),
    ),
  ],
};
