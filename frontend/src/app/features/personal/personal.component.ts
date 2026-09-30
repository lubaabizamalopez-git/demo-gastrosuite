import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalService, Usuario } from './personal.service';

export interface EmpleadoVista {
  id: string;
  ids: number;
  nombre: string;
  rol: string;
  rut: string;
  correo: string;
  activo: boolean;
  foto: string | null;
  codigoPin: string;
}

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss']
})
export class PersonalComponent implements OnInit {
  private personalService = inject(PersonalService);

  // Signals reactivos para el listado maestro de empleados
  public empleados = signal<EmpleadoVista[]>([]);

  // Controladores de estado para la visibilidad del modal y el enfoque de edición
  public modalAbierto = signal<boolean>(false);
  public empleadoSeleccionado = signal<EmpleadoVista | null>(null);

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  cargarEmpleados(): void {
    this.personalService.getUsuarios().subscribe({
      next: (data) => {
        const mapeados: EmpleadoVista[] = data.map(u => ({
          id: u.id,
          ids: u.ids,
          nombre: `${u.nombre} ${u.apellidoPaterno}`,
          rol: u.rolesUsuario.length > 0 ? u.rolesUsuario[0].rol.nombre : 'Sin Rol',
          rut: u.rut || 'No definido',
          correo: u.correo,
          activo: u.estado === 'A',
          foto: u.imagenUrl || null,
          codigoPin: u.codigoPin || ''
        }));
        this.empleados.set(mapeados);
      },
      error: (err) => console.error('Error al cargar empleados', err)
    });
  }

  // Alternador de estado de actividad sincronizado en tiempo real
  public toggleEstado(id: string): void {
    const empleadoActual = this.empleados().find(e => e.id === id);
    if (!empleadoActual) return;
    
    const nuevoEstadoBool = !empleadoActual.activo;
    
    // UI Optimista
    this.empleados.update(lista => 
      lista.map(emp => emp.id === id ? { ...emp, activo: nuevoEstadoBool } : emp)
    );
    
    const actualSeleccionado = this.empleadoSeleccionado();
    if (actualSeleccionado && actualSeleccionado.id === id) {
      this.empleadoSeleccionado.set({ ...actualSeleccionado, activo: nuevoEstadoBool });
    }

    // Persistir en Backend
    this.personalService.toggleEstado(id).subscribe({
      error: (err) => {
        console.error('Error cambiando estado', err);
        // Revertir
        this.empleados.update(lista => 
          lista.map(emp => emp.id === id ? { ...emp, activo: !nuevoEstadoBool } : emp)
        );
        if (actualSeleccionado && actualSeleccionado.id === id) {
          this.empleadoSeleccionado.set({ ...actualSeleccionado, activo: !nuevoEstadoBool });
        }
      }
    });
  }

  // Disparadores de apertura y cierre de modal
  public abrirEdicion(empleado: EmpleadoVista): void {
    this.empleadoSeleccionado.set({ ...empleado });
    this.modalAbierto.set(true);
  }

  public cerrarModal(): void {
    this.modalAbierto.set(false);
    this.empleadoSeleccionado.set(null);
  }

  // Procesador central de lógica para persistencia con la API del Backend (Node.js)
  public ejecutarAccion(tipo: 'guardar' | 'eliminar'): void {
    const empleado = this.empleadoSeleccionado();
    if (!empleado) return;
    
    switch (tipo) {
      case 'guardar':
        // Aquí iría el llamado al backend this.personalService.updateUsuario(...)
        console.log('Guardar cambios aún no implementado en backend para:', empleado.id);
        this.empleados.update(lista =>
          lista.map(emp => emp.id === empleado.id ? { ...empleado } : emp)
        );
        this.cerrarModal();
        break;
        
      case 'eliminar':
        if (confirm(`¿Estás seguro de eliminar a ${empleado.nombre}?`)) {
          // Aquí iría el llamado al backend para eliminar
          console.log('Eliminar aún no implementado en backend para:', empleado.id);
          this.empleados.update(lista => lista.filter(emp => emp.id !== empleado.id));
          this.cerrarModal();
        }
        break;
    }
  }
}
