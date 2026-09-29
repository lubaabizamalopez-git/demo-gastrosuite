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

  // Computado: mesas de la zona activa
  public mesasArea = computed(() => {
    const area = this.zonas().find(a => a.ids === this.zonaActivaId());
    return area && area.mesas ? area.mesas : [];
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
  }

  getIcono(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('terraza')) return 'fa-sun';
    if (n.includes('barra')) return 'fa-glass-martini-alt';
    if (n.includes('vip')) return 'fa-star';
    return 'fa-chair';
  }
}
