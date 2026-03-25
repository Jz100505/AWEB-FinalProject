import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Router — withComponentInputBinding allows route params as @Input()
    provideRouter(routes, withComponentInputBinding()),

    // HTTP client — required by Home (and any component using HttpClient).
    // withFetch() uses the native Fetch API under the hood (better for SSR/edge).
    // ROOT CAUSE FIX: this was missing, causing HttpClient DI to throw
    // synchronously inside Home's constructor, which made Angular 21's
    // effect/zone system abort the router transition with InvalidStateError.
    provideHttpClient(withFetch()),
  ],
};