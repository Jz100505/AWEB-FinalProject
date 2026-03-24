import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [

    // ── Change Detection ───────────────────────────────────
    provideZoneChangeDetection({ eventCoalescing: true }),

    // ── Router ─────────────────────────────────────────────
    provideRouter(
      routes,
      withComponentInputBinding(),   // Bind route params directly as @Input()
      withViewTransitions()          // Smooth page transitions (Angular 17+)
    ),

    // ── HTTP Client ─────────────────────────────────────────
    provideHttpClient(withFetch()),

  ]
};