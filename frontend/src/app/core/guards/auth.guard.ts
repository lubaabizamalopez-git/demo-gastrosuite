import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Revisamos si el usuario tiene un token almacenado
  const token = localStorage.getItem('token');
  
  if (token) {
    return true; // Permitimos el paso
  }

  // Si no hay token, lo devolvemos obligatoriamente al login
  router.navigate(['/login']);
  return false;
};
