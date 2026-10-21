import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PosComponent } from './features/pos/pos.component';
import { OrdenesComponent } from './features/ordenes/ordenes.component';
import { MesasComponent } from './features/mesas/mesas.component';
import { InventarioComponent } from './features/inventario/inventario.component';
import { ClientesComponent } from './features/clientes/clientes.component';
import { ReportesComponent } from './features/reportes/reportes.component';
import { PersonalComponent } from './features/personal/personal.component';
import { ConfiguracionComponent } from './features/configuracion/configuracion.component';
import { GestionProductosComponent } from './features/administracion/productos/gestion-productos/gestion-productos.component';
import { SalonMaestroComponent } from './features/administracion/salon-maestro/salon-maestro.component';
import { authGuard } from './core/guards/auth.guard';

import { IndexSharedComponent } from './shared/index-shared/index-shared.component';
import { MesasAdminComponent } from './features/administracion/mesas-admin/mesas-admin.component';

export const routes: Routes = [
  { path: 'shared', component: IndexSharedComponent },
  { path: '', redirectTo: 'pos', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'pos', component: PosComponent, canActivate: [authGuard] },
  { path: 'ordenes', component: OrdenesComponent, canActivate: [authGuard] },
  { path: 'mesas', component: MesasComponent, canActivate: [authGuard] },

  { path: 'inventario', component: InventarioComponent, canActivate: [authGuard] },
  { path: 'clientes', component: ClientesComponent, canActivate: [authGuard] },
  { path: 'reportes', component: ReportesComponent, canActivate: [authGuard] },
  { path: 'personal', component: PersonalComponent, canActivate: [authGuard] },
  { path: 'configuracion', component: ConfiguracionComponent, canActivate: [authGuard] },
  { path: 'administracion/productos', component: GestionProductosComponent, canActivate: [authGuard] },
  { path: 'administracion/mesas', component: MesasAdminComponent, canActivate: [authGuard] },
  
  // Cualquier ruta desconocida también rebota al login
  { path: '**', redirectTo: 'login' }
];
