import { provideZoneChangeDetection, isDevMode } from "@angular/core";
import { register as registerSwiper } from 'swiper/element/bundle';

registerSwiper();
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules, withComponentInputBinding } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient, withFetch } from "@angular/common/http";

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
    provideHttpClient(withFetch()),
  ],
});
