import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  let token = localStorage.getItem('token');
  
  if (token) {
    return true; // Permitimos el paso
  }

  // Modo Demo: Asignamos automáticamente credenciales de demostración para no bloquear la presentación
  token = 'demo-token-gastrosuite-presentation';
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify({
    id: 'demo-admin-id',
    ids: 1,
    nombre: 'Administrador Demo',
    correo: 'demo@gastrosuite.cl',
    rol: 'SUPERADMIN'
  }));

  return true;
};
