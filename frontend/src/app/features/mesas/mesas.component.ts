import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalonService, AreaSalon, Mesa } from '../../core/services/salon.service';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mesas.component.html',
  styleUrl: './mesas.component.scss'
})
export class MesasComponent implements OnInit {
  public zonas = signal<AreaSalon[]>([]);
  public zonaActivaId = signal<number | null>(null);
  public mesas = signal<Mesa[]>([]);

  // Estados de interfaz
  public showCapa2 = false;
  public showCapa3 = false;
  public mesaActiva: Mesa | null = null;

  // Leyenda de estados implementados para referencia rápida
  public estadosLeyenda = [
    { codigo: 'D', nombre: 'Disponible', color: '#D96B27' },
    { codigo: 'O', nombre: 'Ocupada', color: '#5E8237' },
    { codigo: 'CS', nombre: 'Cta. Solicitada', color: '#A33129' },
    { codigo: 'R', nombre: 'Reservada', color: '#8A6E85' },
    { codigo: 'L', nombre: 'Limpieza', color: '#C47D2B' },
    { codigo: 'EM', nombre: 'Mantenimiento', color: '#4A545C' }
  ];

  // Computado: mesas de la zona activa mapeadas con su UI config
  public mesasArea = computed(() => {
    return this.mesas().map(m => {
      const config = this.getEstadoConfig(m.estado);
      const monto = (m as any).monto || 0;
      const tieneCuentaActiva = (m.estado === 'O' || m.estado === 'CS') && monto > 0;
      return { 
        ...m, 
        config, 
        monto,
        tieneCuentaActiva,
        isActiva: tieneCuentaActiva
      };
    });
  });

  constructor(private salonService: SalonService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.salonService.obtenerAreas().subscribe({
      next: (areas: AreaSalon[]) => {
        this.zonas.set(areas);
        if (areas.length > 0) {
          const idActual = this.zonaActivaId();
          if (!idActual || !areas.find(a => a.ids === idActual)) {
            this.cambiarZona(areas[0].ids);
          }
        } else {
          this.zonaActivaId.set(null);
        }
      },
      error: (err: any) => {
        console.error('Error al cargar áreas', err);
      }
    });
  }

  public cambiarZona(id: number): void {
    this.zonaActivaId.set(id);
    this.showCapa2 = false;
    this.showCapa3 = false;
    
    this.salonService.obtenerMesasPorArea(id).subscribe({
      next: (mesas: Mesa[]) => {
        this.mesas.set(mesas);
      },
      error: (err: any) => {
        console.error('Error al obtener mesas', err);
      }
    });
  }

  toggleCapa2(event: Event, mesa: Mesa) {
    event.stopPropagation();
    this.mesaActiva = mesa;
    this.showCapa2 = !this.showCapa2;
    this.showCapa3 = false;
  }

  openCapa3(event: Event, mesa: Mesa) {
    event.stopPropagation();
    this.mesaActiva = mesa;
    this.showCapa3 = true;
    this.showCapa2 = false;
  }

  closeCapa2(event: Event) {
    event.stopPropagation();
    this.showCapa2 = false;
  }

  closeCapa3() {
    this.showCapa3 = false;
  }

  getEstadoConfig(estado: string) {
    if (estado === 'D') return { bg: '#D96B27', isPasive: false, label: 'Disponible', icono: 'fa-check' };
    if (estado === 'O') return { bg: '#5E8237', isPasive: false, label: 'Ocupada', icono: 'fa-user-friends' };
    if (estado === 'CS') return { bg: '#A33129', isPasive: false, label: 'Cuenta Solicitada', icono: 'fa-receipt' };
    if (estado === 'R') return { bg: '#8A6E85', isPasive: true, label: 'Reservada', icono: 'fa-clock' };
    if (estado === 'L') return { bg: '#C47D2B', isPasive: true, label: 'Limpieza', icono: 'fa-broom' };
    if (estado === 'EM') return { bg: '#4A545C', isPasive: true, label: 'Mantenimiento', icono: 'fa-tools' };
    return { bg: '#D96B27', isPasive: false, label: 'Disponible', icono: 'fa-check' }; // default
  }

  getIcono(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('terraza')) return 'fa-sun';
    if (n.includes('barra')) return 'fa-glass-martini-alt';
    if (n.includes('vip')) return 'fa-star';
    return 'fa-chair';
  }

  formatearCLP(monto: number | null | undefined): string {
    const val = Math.round(Number(monto) || 0);
    const entero = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$${entero}`;
  }
}
