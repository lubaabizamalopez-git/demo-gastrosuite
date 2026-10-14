import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalService, Usuario } from './personal.service';
import { ViewHeaderComponent } from '../../shared/components/view-header/view-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { CustomSelectComponent, SelectOption } from '../../shared/components/custom-select/custom-select.component';
import { ModalConfirmacionComponent } from '../../shared/components/modal-confirmacion/modal-confirmacion.component';
import { AlertModalComponent } from '../../shared/components/alert-modal/alert-modal.component';
import { FormsModule } from '@angular/forms';
import { GeografiaService } from '../../core/services/geografia.service';
import { GourmetSpinnerComponent } from '../../shared/components/gourmet-spinner/gourmet-spinner.component';

export interface EmpleadoVista {
  id: string;
  ids: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rol: string;
  tipoDocumento?: string;
  rut: string;
  correo: string;
  telefono: string;
  direccion: string;
  regionId: number | null;
  ciudadId: number | null;
  comunaId: number | null;
  contactoEmergenciaNombre: string;
  contactoEmergenciaTelefono: string;
  activo: boolean;
  habilitado?: boolean;
  enTurno: boolean;
  inShift?: boolean;
  foto: string | null;
  avatarUrl?: string | null;
  fotoError?: boolean;
  codigoPin: string;
}

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ViewHeaderComponent,
    ButtonComponent,
    BadgeComponent,
    CustomSelectComponent,
    ModalConfirmacionComponent,
    AlertModalComponent,
    GourmetSpinnerComponent
  ],
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss']
})
export class PersonalComponent implements OnInit {
  private personalService = inject(PersonalService);
  private geografiaService = inject(GeografiaService);

  public empleados = signal<EmpleadoVista[]>([]);
  public cargando = signal<boolean>(true);
  public guardando = signal<boolean>(false);
  public errores = signal<any>({});
  public regiones = signal<any[]>([]);
  public ciudades = signal<any[]>([]);
  public comunas = signal<any[]>([]);

  public modalAbierto = signal<boolean>(false);
  public modoFormulario = signal<'crear' | 'editar'>('editar');
  public formEmpleado = signal<any>(null);
  public ciudadesOptions = computed(() => {
    return [{ value: null, label: 'Seleccionar...', disabled: true }, ...this.ciudades().map(c => ({ value: c.id, label: c.nombre }))];
  });
  public comunasOptions = computed(() => {
    return [{ value: null, label: 'Seleccionar...', disabled: true }, ...this.comunas().map(c => ({ value: c.id, label: c.nombre }))];
  });
  public regionesSelectOptions = computed(() => {
    return [{ value: null, label: 'Seleccionar...', disabled: true }, ...this.regiones().map(r => ({ value: r.id, label: r.nombre }))];
  });

  public searchTerm = signal<string>('');
  public filterStatus = signal<'todos' | 'activos' | 'inactivos' | 'turno' | 'descanso'>('todos');

  public empleadosFiltrados = computed(() => {
    let list = this.empleados();
    const term = this.searchTerm().toLowerCase();
    if (term) {
      list = list.filter(e => 
        e.nombre.toLowerCase().includes(term) || 
        (e.apellidoPaterno && e.apellidoPaterno.toLowerCase().includes(term)) ||
        (e.rut && e.rut.includes(term)) ||
        (e.correo && e.correo.toLowerCase().includes(term))
      );
    }
    const status = this.filterStatus();
    if (status === 'activos') list = list.filter(e => e.activo);
    if (status === 'inactivos') list = list.filter(e => !e.activo);
    if (status === 'turno') list = list.filter(e => e.enTurno);
    if (status === 'descanso') list = list.filter(e => !e.enTurno && e.activo);
    
    return list;
  });

  public modalConfirmacionAbierto = signal<boolean>(false);
  public empleadoAConfirmar = signal<EmpleadoVista | null>(null);

  public alertaModal = signal<{abierto: boolean, titulo: string, mensaje: string, tipo: 'success'|'error'}>({abierto: false, titulo: '', mensaje: '', tipo: 'error'});

      public docOptions: SelectOption[] = [
    { value: null, label: 'Seleccionar...', disabled: true },
    { value: 'RUT', label: 'RUT' },
    { value: 'PASAPORTE', label: 'Pasaporte / Otro' }
  ];

  public rolesOptions: SelectOption[] = [
    { value: null, label: 'Seleccionar...', disabled: true },
    { value: 'MESERO', label: 'MESERO' },
    { value: 'CAJERO', label: 'CAJERO' },
    { value: 'SUPERADMIN', label: 'SUPERADMIN' }
  ];

  public regionesOptions: SelectOption[] = [
    { value: 1, label: 'Región Metropolitana' },
    { value: 2, label: 'Región de Valparaíso' }
  ];

  public filtroOptions: SelectOption[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'activos', label: 'Activos' },
    { value: 'turno', label: 'En Turno' },
    { value: 'descanso', label: 'En Descanso' },
    { value: 'inactivos', label: 'Inactivos' }
  ];

  

  ngOnInit(): void {
    this.cargarEmpleados();
    this.cargarRegiones();
  }

  cargarRegiones(): void {
    this.geografiaService.getRegiones().subscribe({
      next: (data) => this.regiones.set(data),
      error: (err) => console.error('Error al cargar regiones', err)
    });
  }

  cargarEmpleados(): void {
    this.personalService.getUsuarios().subscribe({
      next: (data) => {
        const mapeados: EmpleadoVista[] = data.map(u => ({
          id: u.id,
          ids: u.ids,
          nombre: u.nombre || '',
          apellidoPaterno: u.apellidoPaterno || '',
          apellidoMaterno: u.apellidoMaterno || '',
          rol: u.rolesUsuario.length > 0 ? u.rolesUsuario[0].rol.nombre : 'Sin Rol',
          tipoDocumento: u.tipoDocumento || 'RUT',
          rut: u.rut || '',
          correo: u.correo,
          telefono: u.telefono !== 'NULL' ? u.telefono || '' : '',
          direccion: u.direccion !== 'NULL' ? u.direccion || '' : '',
          regionId: u.regionId || null,
          ciudadId: u.ciudadId || null,
          estado: u.estado || 'A',
          comunaId: u.comunaId || null,
          contactoEmergenciaNombre: u.contactoEmergenciaNombre !== 'NULL' ? u.contactoEmergenciaNombre || '' : '',
          contactoEmergenciaTelefono: u.contactoEmergenciaTelefono !== 'NULL' ? u.contactoEmergenciaTelefono || '' : '',
          activo: u.estado === 'A',
          habilitado: u.estado === 'A',
          enTurno: u.estado === 'A' && Math.random() > 0.5,
          inShift: u.estado === 'A' && Math.random() > 0.5,
          foto: (u.imagenUrl && u.imagenUrl !== 'NULL') ? u.imagenUrl : null,
          avatarUrl: (u.imagenUrl && u.imagenUrl !== 'NULL') ? u.imagenUrl : null,
          fotoError: false,
          codigoPin: u.codigoPin || ''
        }));
        this.empleados.set(mapeados);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar empleados', err);
        this.cargando.set(false);
      }
    });
  }

  public actualizarCampo(campo: string, valor: any): void {
    const actual = this.formEmpleado();
    if (actual) {
      this.formEmpleado.set({ ...actual, [campo]: valor });
    }
  }

  public actualizarRol(nuevoRol: any): void {
    this.actualizarCampo('rol', nuevoRol);
  }

  public actualizarRegion(regionId: any): void {
    this.actualizarCampo('regionId', regionId);
    this.actualizarCampo('ciudadId', null);
    this.actualizarCampo('comunaId', null); // Reset comuna
    this.ciudades.set([]);
    this.comunas.set([]);
    if (regionId) {
      this.geografiaService.getCiudadesPorRegion(regionId).subscribe(c => this.ciudades.set(c));
    }
  }

  public actualizarCiudad(ciudadId: any): void {
    this.actualizarCampo('ciudadId', ciudadId);
    this.actualizarCampo('comunaId', null); // Reset comuna
    this.comunas.set([]);
    if (ciudadId) {
      this.geografiaService.getComunasPorCiudad(ciudadId).subscribe(c => this.comunas.set(c));
    }
  }

  public toggleEstado(id: string): void {
    const empleadoActual = this.empleados().find(e => e.id === id);
    if (!empleadoActual) return;
    const nuevoEstadoBool = !empleadoActual.activo;
    this.empleados.update(lista => lista.map(emp => emp.id === id ? { ...emp, activo: nuevoEstadoBool, habilitado: nuevoEstadoBool } : emp));
    this.personalService.toggleEstado(id).subscribe({
      error: (err) => {
        console.error('Error cambiando estado', err);
        this.empleados.update(lista => lista.map(emp => emp.id === id ? { ...emp, activo: !nuevoEstadoBool, habilitado: !nuevoEstadoBool } : emp));
      }
    });
  }

  public toggleHabilitado(empleadoOId: EmpleadoVista | string): void {
    const id = typeof empleadoOId === 'string' ? empleadoOId : empleadoOId.id;
    this.toggleEstado(id);
  }

  public abrirEdicion(empleado: EmpleadoVista): void {
    this.modoFormulario.set('editar');
    
    // Cargar comunas y ciudades
    if (empleado.regionId) {
      this.geografiaService.getCiudadesPorRegion(empleado.regionId).subscribe(c => this.ciudades.set(c));
    }
    if (empleado.ciudadId) {
      this.geografiaService.getComunasPorCiudad(empleado.ciudadId).subscribe(c => this.comunas.set(c));
    }

    this.formEmpleado.set({ 
      ...empleado, 
      clave: '', 
      repetirClave: '',
      repetirCorreo: empleado.correo,
      imagenUrl: empleado.foto
    });
    this.modalAbierto.set(true);
  }

  public abrirNuevoEmpleado(): void {
    this.modoFormulario.set('crear');
    
    
    this.formEmpleado.set({
      id: '',
      ids: 0,
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      rol: '', 
      tipoDocumento: 'RUT',
      rut: '',
      correo: '',
      repetirCorreo: '',
      telefono: '',
      direccion: '',
      regionId: null,
      ciudadId: null,
      estado: 'A',
      comunaId: null,
      contactoEmergenciaNombre: '',
      contactoEmergenciaTelefono: '',
      activo: true,
      foto: null,
      imagenUrl: '',
      codigoPin: '',
      clave: '',
      repetirClave: ''
    });
    this.modalAbierto.set(true);
  }

  public cerrarModal(): void {
    this.modalAbierto.set(false);
    this.formEmpleado.set(null);
  }

  public confirmarEliminacion(empleado: EmpleadoVista): void {
    this.empleadoAConfirmar.set(empleado);
    this.modalConfirmacionAbierto.set(true);
  }

  public procesarConfirmacionEliminacion(confirmado: boolean): void {
    const empleado = this.empleadoAConfirmar();
    this.modalConfirmacionAbierto.set(false);
    this.empleadoAConfirmar.set(null);

    if (confirmado && empleado) {
      this.personalService.deleteUsuario(empleado.id).subscribe({
        next: () => {
          this.empleados.update(lista => lista.filter(emp => emp.id !== empleado.id));
          this.cerrarModal();
        },
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }

    public manejarErrorImagen(empleadoId: string): void {
    this.empleados.update(lista => 
      lista.map(emp => emp.id === empleadoId ? { ...emp, fotoError: true } : emp)
    );
  }

  public validarRut(rutCompleto: string): boolean {
    if (!rutCompleto) return false;
    rutCompleto = rutCompleto.replace(/[^0-9kK]/g, '');
    if (rutCompleto.length < 8) return false;
    const rut = rutCompleto.slice(0, -1);
    const dv = rutCompleto.slice(-1).toUpperCase();
    let suma = 0;
    let multiplicador = 2;
    for (let i = rut.length - 1; i >= 0; i--) {
      suma += parseInt(rut[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
    return dv === dvCalculado;
  }

  public procesarArchivoImagen(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.actualizarCampo('imagenUrl', e.target?.result);
      };
      reader.readAsDataURL(file);
    } else {
      this.alertaModal.set({ abierto: true, titulo: 'Formato inválido', mensaje: 'Solo se permiten imágenes.', tipo: 'error' });
    }
  }

  public validarFormulario(): boolean {
    const form = this.formEmpleado();
    let errs: any = {};
    let isValid = true;

    if (!form.nombre || form.nombre.trim().length === 0) { errs['nombre'] = 'Nombre requerido'; isValid = false; }
    else if (form.nombre.length > 50) { errs['nombre'] = 'Máximo 50 caracteres'; isValid = false; }

    if (!form.apellidoPaterno || form.apellidoPaterno.trim().length === 0) { errs['apellidoPaterno'] = 'Apellido paterno requerido'; isValid = false; }
    else if (form.apellidoPaterno.length > 50) { errs['apellidoPaterno'] = 'Máximo 50 caracteres'; isValid = false; }

    if (form.apellidoMaterno && form.apellidoMaterno.length > 50) { errs['apellidoMaterno'] = 'Máximo 50 caracteres'; isValid = false; }
    if (form.direccion && form.direccion.length > 150) { errs['direccion'] = 'Máximo 150 caracteres'; isValid = false; }
    if (form.contactoEmergenciaNombre && form.contactoEmergenciaNombre.length > 50) { errs['contactoEmergenciaNombre'] = 'Máximo 50 caracteres'; isValid = false; }
    if (!form.rol) { errs['rol'] = 'Requerido'; isValid = false; }

    if (form.tipoDocumento === 'RUT') {
      if (!form.rut || !this.validarRut(form.rut)) { errs['rut'] = 'RUT inválido'; isValid = false; }
    } else {
      if (!form.rut || form.rut.trim() === '') { errs['rut'] = 'Documento es requerido'; isValid = false; }
    }

    if (!form.correo || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.correo)) { errs['correo'] = 'Correo electróúnico inválido'; isValid = false; }
    if (form.correo !== form.repetirCorreo) { errs['repetirCorreo'] = 'Los correos no coinciden'; isValid = false; }

    if (form.telefono && form.telefono !== 'NULL' && form.telefono.trim() !== '') {
      if (!/^\+569\d{8}$/.test(form.telefono.trim())) { errs['telefono'] = 'Debe ser formato +569XXXXXXXX'; isValid = false; }
    }

    if (form.contactoEmergenciaTelefono && form.contactoEmergenciaTelefono !== 'NULL' && form.contactoEmergenciaTelefono.trim() !== '') {
      if (!/^\+569\d{8}$/.test(form.contactoEmergenciaTelefono.trim())) { errs['contactoEmergenciaTelefono'] = 'Debe ser formato +569XXXXXXXX'; isValid = false; }
    }

    if (form.codigoPin && form.codigoPin !== 'NULL' && form.codigoPin.trim() !== '') {
      if (!/^\d{4}$/.test(form.codigoPin.trim())) { errs['codigoPin'] = 'El PIN debe ser exactamente de 4 dígitos'; isValid = false; }
    }

    if (form.clave && form.clave.trim() !== '') {
      if (!/^[a-zA-Z0-9\W_]{8,12}$/.test(form.clave)) { errs['clave'] = 'Debe tener entre 8 y 12 caracteres'; isValid = false; }
      if (form.clave !== form.repetirClave) { errs['repetirClave'] = 'Las contraseñas no coinciden'; isValid = false; }
    }

    this.errores.set(errs);
    return isValid;
  }

  public ejecutarAccion(tipo: 'guardar'): void {
    const form = this.formEmpleado();
    if (!form) return;

    if (!this.validarFormulario()) {
      this.alertaModal.set({
        abierto: true,
        titulo: 'Revisa los campos',
        mensaje: 'No se pudo procesar tu solicitud porque existen errores en el formulario.',
        tipo: 'error'
      });
      return;
    }

    this.guardando.set(true);

    const payload: any = {
      nombre: form.nombre,
      apellidoPaterno: form.apellidoPaterno,
      apellidoMaterno: form.apellidoMaterno || 'NULL',
      tipoDocumento: form.tipoDocumento || 'RUT',
      rut: form.rut,
      correo: form.correo,
      telefono: form.telefono || 'NULL',
      direccion: form.direccion || 'NULL',
      regionId: form.regionId ? Number(form.regionId) : null,
      ciudadId: form.ciudadId ? Number(form.ciudadId) : null,
      estado: form.estado || 'A',
      comunaId: form.comunaId ? Number(form.comunaId) : null,
      contactoEmergenciaNombre: form.contactoEmergenciaNombre || 'NULL',
      contactoEmergenciaTelefono: form.contactoEmergenciaTelefono || 'NULL',
      codigoPin: form.codigoPin || 'NULL',
      roles: form.rol ? [form.rol] : []
    };

    
    if (payload.tipoDocumento === 'RUT' && payload.rut) {
      let rutLimpio = payload.rut.replace(/[^0-9kK]/g, '');
      payload.dv = rutLimpio.slice(-1).toUpperCase();
      payload.rut = rutLimpio.slice(0, -1);
    } else {
      payload.dv = 'NULL';
    }

    if (form.imagenUrl && form.imagenUrl.trim() !== '') {
      payload.imagenUrl = form.imagenUrl;
    } else {
      payload.imagenUrl = 'NULL';
    }

    if (!form.codigoPin || form.codigoPin.trim() === '') {
      payload.codigoPin = payload.rut.substring(0, 4);
    } else {
      payload.codigoPin = form.codigoPin;
    }

    if (!form.clave || form.clave.trim() === '') {
      payload.clave = payload.rut + (payload.dv !== 'NULL' ? '-' + payload.dv : '');
    } else {
      payload.clave = form.clave;
    }

    if (this.modoFormulario() === 'crear') {
      this.personalService.createUsuario(payload).subscribe({
        next: () => {
          this.guardando.set(false);
          this.alertaModal.set({ abierto: true, titulo: 'Yeeeiiii!', mensaje: 'Funcionario creado con éxito', tipo: 'success' });
          this.cargarEmpleados();
          this.cerrarModal();
        },
        error: (err: any) => {
          this.guardando.set(false);
          this.alertaModal.set({ abierto: true, titulo: 'Ups!', mensaje: err?.error?.message || 'No se pudo crear. Verifica el correo o número de documento / RUT.', tipo: 'error' });
        }
      });
    } else {
      this.personalService.updateUsuario(form.id, payload).subscribe({
        next: () => {
          this.guardando.set(false);
          this.alertaModal.set({ abierto: true, titulo: 'Yeeeiiii!', mensaje: 'Funcionario actualizado con éxito', tipo: 'success' });
          this.cargarEmpleados();
          this.cerrarModal();
        },
        error: (err: any) => {
          this.guardando.set(false);
          this.alertaModal.set({ abierto: true, titulo: 'Ups!', mensaje: err?.error?.message || 'No se pudo actualizar la ficha.', tipo: 'error' });
        }
      });
    }
  }

  public cerrarAlerta(): void {
    this.alertaModal.set({abierto: false, titulo: '', mensaje: '', tipo: 'error'});
  }
}
