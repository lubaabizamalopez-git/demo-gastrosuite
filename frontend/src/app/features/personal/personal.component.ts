import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonalService, Usuario } from './personal.service';
import { ModalPersonalComponent } from './modal-personal/modal-personal.component';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalPersonalComponent],
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss']
})
export class PersonalComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  
  filtroRol: string = 'todos';
  filtroEstado: string = 'todos'; // 'todos' o 'A' o 'I'

  isModalOpen = false;
  isEditMode = false;
  usuarioSeleccionado: Usuario | null = null;

  constructor(private personalService: PersonalService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.personalService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.aplicarFiltros();
      },
      error: (err) => console.error('Error cargando usuarios', err)
    });
  }

  aplicarFiltros(): void {
    this.usuariosFiltrados = this.usuarios.filter(u => {
      // Filtro por Estado
      const cumpleEstado = this.filtroEstado === 'todos' || u.estado === this.filtroEstado;
      
      // Filtro por Rol
      let cumpleRol = true;
      if (this.filtroRol !== 'todos') {
        cumpleRol = u.rolesUsuario.some(ru => ru.rol.nombre === this.filtroRol);
      }

      return cumpleEstado && cumpleRol;
    });
  }

  getRolesDisponibles(): string[] {
    // Extraer roles únicos de la lista actual de usuarios
    const roles = new Set<string>();
    this.usuarios.forEach(u => {
      u.rolesUsuario.forEach(ru => roles.add(ru.rol.nombre));
    });
    return Array.from(roles);
  }

  trackByFn(index: number, item: Usuario): string {
    return item.id;
  }

  toggleEstadoUsuario(usuario: Usuario): void {
    // UI Optimista
    const estadoOriginal = usuario.estado;
    const nuevoEstado = estadoOriginal === 'A' ? 'I' : 'A';
    usuario.estado = nuevoEstado;
    this.aplicarFiltros(); // Refiltrar si es necesario

    this.personalService.toggleEstado(usuario.id).subscribe({
      next: (res) => {
        // Confirmado por el backend
        usuario.estado = res.estado;
      },
      error: (err) => {
        console.error('Error al cambiar estado', err);
        // Revertir
        usuario.estado = estadoOriginal;
        this.aplicarFiltros();
      }
    });
  }

  abrirModalNuevo(): void {
    this.isEditMode = false;
    this.usuarioSeleccionado = null;
    this.isModalOpen = true;
  }

  abrirModalEditar(usuario: Usuario): void {
    this.isEditMode = true;
    this.usuarioSeleccionado = usuario;
    this.isModalOpen = true;
  }

  cerrarModal(): void {
    this.isModalOpen = false;
    this.usuarioSeleccionado = null;
  }

  onSaveSuccess(usuarioActualizado: Usuario): void {
    if (this.isEditMode) {
      const index = this.usuarios.findIndex(u => u.id === usuarioActualizado.id);
      if (index !== -1) {
        this.usuarios[index] = usuarioActualizado;
      }
    } else {
      this.usuarios.push(usuarioActualizado);
    }
    this.aplicarFiltros();
  }

  getRolesString(usuario: Usuario): string {
    return usuario.rolesUsuario.map(r => r.rol.nombre).join(', ') || 'Sin Rol';
  }

  getAvatarInitials(usuario: Usuario): string {
    return `${usuario.nombre.charAt(0)}${usuario.apellidoPaterno.charAt(0)}`.toUpperCase();
  }

  getRolClase(usuario: Usuario): string {
    const rolesStr = this.getRolesString(usuario).toLowerCase();
    if (rolesStr.includes('admin')) {
      return 'bg-status-error-bg text-status-error-text'; // Color rojo para admins
    } else if (rolesStr.includes('mesero') || rolesStr.includes('cajero')) {
      return 'bg-brand-soft text-brand-primary';
    }
    return 'bg-neutral-border text-text-muted'; // Default
  }
}
