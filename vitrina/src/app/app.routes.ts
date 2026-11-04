import { Routes } from '@angular/router';
import { VitrinaLayoutComponent } from './features/vitrina-layout/vitrina-layout.component';
import { InicioComponent } from './features/inicio/inicio.component';

export const routes: Routes = [
  // TODO SaaS: reemplazar por un listado/landing de restaurantes cuando existan varios
  { path: '', redirectTo: 'vitrina-demo', pathMatch: 'full' },
  {
    path: ':slug',
    component: VitrinaLayoutComponent,
    children: [
      { path: '', component: InicioComponent },
      {
        path: 'checkout',
        loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
      },
      {
        path: 'pedido/:codigo',
        loadComponent: () => import('./features/seguimiento/seguimiento.component').then(m => m.SeguimientoComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
