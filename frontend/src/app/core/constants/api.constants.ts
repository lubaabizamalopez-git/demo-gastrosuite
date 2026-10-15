export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Si estamos en desarrollo local en Angular CLI (puerto 4200)
    if (window.location.hostname === 'localhost' && window.location.port === '4200') {
      return 'http://localhost:3000';
    }
  }
  // En producción (Portainer, VPS con Nginx o Docker) usamos URLs relativas
  return '';
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
