import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalonService, AreaSalon, Mesa } from '../../../core/services/salon.service';

interface EstadoMesa {
  id: string;
  nombre: string;
  colorBg: string; // Clase de tu Design System
  colorText: string;
  icono: string;
}

@Component({
  selector: 'app-salon-maestro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './salon-maestro.component.html'
})
export class SalonMaestroComponent implements OnInit {
  private salonService = inject(SalonService);

  // 1. Estados Dinámicos con sus Colores Fuertes (No Pastel)
  public estados = signal<EstadoMesa[]>([
    { id: 'libre', nombre: 'Disponible', colorBg: 'bg-brand-primary', colorText: 'text-white', icono: 'fa-check-circle' },
    { id: 'ocupada', nombre: 'Ocupada', colorBg: 'bg-status-error-text', colorText: 'text-white', icono: 'fa-user-friends' },
    { id: 'cuenta', nombre: 'Cuenta Solicitada', colorBg: 'bg-status-success-text', colorText: 'text-white', icono: 'fa-money-bill-wave' },
    { id: 'reservada', nombre: 'Reservada', colorBg: 'bg-text-muted', colorText: 'text-white', icono: 'fa-clock' }
  ]);

  // 2. Filtros y Gestión de Nuevas Áreas/Zonas
  public zonas = signal<AreaSalon[]>([]);
  public zonaSeleccionada = signal<number | null>(null);

  // Mesas obtenidas de la base de datos
  public mesas = signal<Mesa[]>([]);

  // 3. Control de Modales de Historial
  public modalHistorialAbierto = signal<boolean>(false);
  public mesaSeleccionadaHistorial = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarDatos();
  }

  public cargarDatos(): void {
    this.salonService.obtenerAreas().subscribe({
      next: (areas) => {
        this.zonas.set(areas);
        if (areas.length > 0) {
          this.seleccionarZona(areas[0].ids);
        }
      },
      error: (err) => console.error('Error al obtener áreas', err)
    });
  }

  public seleccionarZona(areaIds: number): void {
    this.zonaSeleccionada.set(areaIds);
    this.salonService.obtenerMesasPorArea(areaIds).subscribe({
      next: (mesas) => {
        this.mesas.set(mesas);
      },
      error: (err) => console.error('Error al obtener mesas', err)
    });
  }

  public agregarNuevaZona(nuevaZona: string): void {
    if (nuevaZona.trim()) {
      this.salonService.crearArea({ nombre: nuevaZona, orden: this.zonas().length + 1 }).subscribe({
        next: (area) => {
          this.zonas.update(z => [...z, area]);
          if (!this.zonaSeleccionada()) {
            this.seleccionarZona(area.ids);
          }
        },
        error: (err) => console.error('Error al crear área', err)
      });
    }
  }

  // --- DRAG AND DROP LÓGICA ---
  public onDragStartNuevo(event: DragEvent, tipoMesa: string) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('nuevoTipo', tipoMesa);
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  public onDragStartMesaExistente(event: DragEvent, mesaIds: number) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('mesaIds', mesaIds.toString());
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  public onDragOver(event: DragEvent) {
    event.preventDefault(); // Permitir Drop
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = event.dataTransfer.types.includes('nuevoTipo') ? 'copy' : 'move';
    }
  }

  public onDrop(event: DragEvent) {
    event.preventDefault();
    if (!this.zonaSeleccionada()) return;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    // Ajustar offset para que el cursor quede al centro de la mesa (aprox 40px)
    const x = Math.max(0, event.clientX - rect.left - 60);
    const y = Math.max(0, event.clientY - rect.top - 60);

    const nuevoTipo = event.dataTransfer?.getData('nuevoTipo');
    const mesaIds = event.dataTransfer?.getData('mesaIds');

    if (nuevoTipo) {
      // Crear nueva mesa
      let cap = 4;
      if (nuevoTipo === 'redonda') cap = 6;
      if (nuevoTipo === 'barra') cap = 1;
      if (nuevoTipo === 'rectangular') cap = 6;
      
      const areaActual = this.zonas().find(z => z.ids === this.zonaSeleccionada())!;
      
      this.salonService.crearMesa({
        areaSalonId: areaActual.id,
        numeroMesa: 'N-' + Math.floor(Math.random() * 1000),
        capacidad: cap,
        posX: Math.round(x),
        posY: Math.round(y)
      }).subscribe({
        next: (nuevaMesa) => this.mesas.update(m => [...m, nuevaMesa]),
        error: (err) => console.error('Error al soltar nueva mesa', err)
      });
    } else if (mesaIds) {
      // Mover mesa existente
      const ids = parseInt(mesaIds, 10);
      this.salonService.actualizarMesa(ids, { posX: Math.round(x), posY: Math.round(y) }).subscribe({
        next: (mesaActualizada) => {
          this.mesas.update(mesas => mesas.map(m => m.ids === ids ? mesaActualizada : m));
        },
        error: (err) => console.error('Error al mover mesa', err)
      });
    }
  }

  public abrirHistorial(idMesa: string): void {
    this.mesaSeleccionadaHistorial.set(idMesa);
    this.modalHistorialAbierto.set(true);
  }

  public cerrarHistorial(): void {
    this.modalHistorialAbierto.set(false);
  }
}
