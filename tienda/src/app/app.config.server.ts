import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { URL_API_SERVIDOR } from './core/constantes/api.constantes';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    // Dentro de Docker apunta al contenedor del backend (ej. http://backend:3000)
    { provide: URL_API_SERVIDOR, useValue: process.env['API_URL'] || 'http://localhost:3000' },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
