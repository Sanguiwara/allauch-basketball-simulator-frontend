import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import {provideHttpClient, withInterceptors, withInterceptorsFromDi} from '@angular/common/http';
import {authHttpInterceptorFn, provideAuth0} from '@auth0/auth0-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authHttpInterceptorFn])),

    ...provideAuth0({
      domain: 'dev-csf1pz6vkgyyinsz.us.auth0.com',
      clientId: 'ccW5NjuTahPGYv17gaJgGMjxZsk2aVsq',
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: 'https://allauch-simulator-backend/',
      },
      httpInterceptor: {
        allowedList: [
          {
            uri: 'http://localhost:8080/*',
            tokenOptions: {
              authorizationParams: {
                audience: 'https://allauch-simulator-backend/',
              },
            },
          },
        ],
      },
    }),
  ],
};
