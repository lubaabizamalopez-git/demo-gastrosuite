import { Injectable, signal } from '@angular/core';
import { Empresa } from '../modelos/vitrina.model';

/** Restaurante que se está visitando (lo carga el layout de la vitrina) */
@Injectable({ providedIn: 'root' })
export class EmpresaActualService {
  readonly empresa = signal<Empresa | null>(null);
  /** Controla el modal "Próximamente" del registro de clientes */
  readonly mostrarProximamente = signal(false);
}
