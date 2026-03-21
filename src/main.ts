import { provideZoneChangeDetection, isDevMode } from "@angular/core";
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules, withComponentInputBinding } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { authInterceptor } from './app/services/auth/auth-interceptor';
import { LOCALE_ID } from '@angular/core';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { register as registerSwiper } from 'swiper/element/bundle';

registerSwiper();

registerLocaleData(localeEs, 'es-ES');

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(), { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes,
      withComponentInputBinding(),
      withPreloading(PreloadAllModules)),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'es-ES' }
  ],
});
