import { HttpInterceptorFn } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';

/**
 * URL absoluta del backend, provista SOLO al renderizar en el servidor (SSR).
 * En el navegador las rutas son relativas (/api/...) y las resuelve el proxy (dev) o nginx (prod).
 */
export const URL_API_SERVIDOR = new InjectionToken<string>('URL_API_SERVIDOR');

export function apiUrl(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

/** En SSR antepone la URL del backend a las rutas relativas /api y /uploads */
export const interceptorUrlServidor: HttpInterceptorFn = (req, next) => {
  const base = inject(URL_API_SERVIDOR, { optional: true });
  if (base && req.url.startsWith('/')) {
    return next(req.clone({ url: `${base}${req.url}` }));
  }
  return next(req);
};

export function resolverUrlImagen(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return url.startsWith('/') ? url : `/${url}`;
}
