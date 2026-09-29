import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AreaSalon, Mesa, SalonService } from '../../../../core/services/salon.service';
import { ModalAreaComponent } from '../modal-area/modal-area.component';
import { ModalMesaComponent } from '../modal-mesa/modal-mesa.component';

@Component({
  selector: 'app-gestion-salon',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalAreaComponent, ModalMesaComponent],
  templateUrl: './gestion-salon.component.html',
})
export class GestionSalonComponent implements OnInit {
  // Signals según requerimiento
  public areas = signal<AreaSalon[]>([]);
  public areaActivaId = signal<number | null>(null);

  // Computado: encuentra el área completa basándose en el ID activo
  public areaActiva = computed(() => {
    return this.areas().find(a => a.ids === this.areaActivaId()) || null;
  });

  // Computado: mesas del área activa
  public mesasArea = computed(() => {
    const area = this.areaActiva();
    return area && area.mesas ? area.mesas : [];
  });
  
  // Modales
  mostrarModalArea = false;
  areaEnEdicion: AreaSalon | null = null;
  mostrarModalMesa = false;
  mesaEnEdicion: Mesa | null = null;

  // Variables para Drag and Drop HTML5 Nativo
  mesaArrastrada: Mesa | null = null;
  dragOffsetX = 0;
  dragOffsetY = 0;

  constructor(private salonService: SalonService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.salonService.obtenerAreas().subscribe({
      next: (areas: AreaSalon[]) => {
        this.areas.set(areas);
        if (areas.length > 0) {
          const idActual = this.areaActivaId();
          if (!idActual || !areas.find(a => a.ids === idActual)) {
            this.cambiarArea(areas[0].ids);
          }
        } else {
          this.areaActivaId.set(null);
        }
      },
      error: (err: any) => {
        console.error('Error al cargar áreas', err);
        alert('No se pudieron cargar las áreas');
      }
    });
  }

  public cambiarArea(id: number): void {
    this.areaActivaId.set(id);
  }

  // Helper para asignar un icono a cada área si no viene de BD
  getIcono(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('terraza')) return 'fa-sun';
    if (n.includes('barra')) return 'fa-glass-martini-alt';
    if (n.includes('vip')) return 'fa-star';
    return 'fa-chair';
  }

  // --- DRAG AND DROP NATIVO ---
  onDragStart(mesa: Mesa, event: DragEvent) {
    this.mesaArrastrada = mesa;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      this.dragOffsetX = event.clientX - rect.left;
      this.dragOffsetY = event.clientY - rect.top;
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (!this.mesaArrastrada) return;

    const container = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const nuevaX = event.clientX - container.left - this.dragOffsetX;
    const nuevaY = event.clientY - container.top - this.dragOffsetY;

    this.mesaArrastrada.posX = Math.max(0, nuevaX);
    this.mesaArrastrada.posY = Math.max(0, nuevaY);

    this.salonService.actualizarMesa(this.mesaArrastrada.ids, {
      posX: this.mesaArrastrada.posX,
      posY: this.mesaArrastrada.posY
    }).subscribe({
      error: (err: any) => {
        console.error('Error guardando posición', err);
        this.cargarDatos();
      }
    });

    this.mesaArrastrada = null;
  }

  // --- MODALES Y CRUD ---
  abrirModalArea() {
    this.areaEnEdicion = null;
    this.mostrarModalArea = true;
  }

  editarArea(area: AreaSalon) {
    this.areaEnEdicion = { ...area };
    this.mostrarModalArea = true;
  }

  eliminarArea(area: AreaSalon) {
    if (confirm(`¿Eliminar Área "${area.nombre}" y TODAS sus mesas?`)) {
      this.salonService.eliminarArea(area.ids).subscribe({
        next: () => {
          if (this.areaActivaId() === area.ids) this.areaActivaId.set(null);
          this.cargarDatos();
        },
        error: (err: any) => {
          console.error(err);
          alert('No se pudo eliminar el área');
        }
      });
    }
  }

  cerrarModalArea(actualizar: boolean) {
    this.mostrarModalArea = false;
    this.areaEnEdicion = null;
    if (actualizar) this.cargarDatos();
  }

  abrirModalMesa() {
    if (!this.areaActivaId()) {
      alert('Debes seleccionar un área primero');
      return;
    }
    this.mesaEnEdicion = null;
    this.mostrarModalMesa = true;
  }

  editarMesa(mesa: Mesa, event: Event) {
    event.stopPropagation();
    this.mesaEnEdicion = { ...mesa };
    this.mostrarModalMesa = true;
  }

  eliminarMesa(mesa: Mesa, event: Event) {
    event.stopPropagation();
    if (confirm(`¿Eliminar la mesa ${mesa.numeroMesa}?`)) {
      this.salonService.eliminarMesa(mesa.ids).subscribe({
        next: () => {
          this.cargarDatos();
        },
        error: (err: any) => {
          console.error(err);
          alert('No se pudo eliminar la mesa');
        }
      });
    }
  }

  cerrarModalMesa(actualizar: boolean) {
    this.mostrarModalMesa = false;
    this.mesaEnEdicion = null;
    if (actualizar) this.cargarDatos();
  }
}
