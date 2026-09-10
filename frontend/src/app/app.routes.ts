import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PosComponent } from './features/pos/pos.component';
import { OrdenesComponent } from './features/ordenes/ordenes.component';
import { MesasComponent } from './features/mesas/mesas.component';
import { MenuComponent } from './features/menu/menu.component';
import { InventarioComponent } from './features/inventario/inventario.component';
import { ClientesComponent } from './features/clientes/clientes.component';
import { ReportesComponent } from './features/reportes/reportes.component';
import { PersonalComponent } from './features/personal/personal.component';
import { ConfiguracionComponent } from './features/configuracion/configuracion.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'pos', component: PosComponent },
  { path: 'ordenes', component: OrdenesComponent },
  { path: 'mesas', component: MesasComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'inventario', component: InventarioComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'reportes', component: ReportesComponent },
  { path: 'personal', component: PersonalComponent },
  { path: 'configuracion', component: ConfiguracionComponent }
];
