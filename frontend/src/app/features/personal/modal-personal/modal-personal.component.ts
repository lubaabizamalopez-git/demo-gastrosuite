import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PersonalService, Rol, Usuario } from '../personal.service';

@Component({
  selector: 'app-modal-personal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-personal.component.html',
  styleUrls: ['./modal-personal.component.scss']
})
export class ModalPersonalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() editMode = false;
  @Input() usuarioAEditar: Usuario | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveSuccess = new EventEmitter<Usuario>();

  usuarioForm: FormGroup;
  rolesDisponibles: Rol[] = [];
  tiposDocumento = ['RUT', 'PASAPORTE', 'DNI_EXTRANJERO'];

  constructor(
    private fb: FormBuilder,
    private personalService: PersonalService
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: [''],
      tipoDocumento: ['RUT', Validators.required],
      rut: [''],
      dv: [''],
      correo: ['', [Validators.required, Validators.email]],
      codigoPin: [''],
      roles: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarRoles();
  }

  ngOnChanges(): void {
    if (this.isOpen && this.editMode && this.usuarioAEditar) {
      this.usuarioForm.patchValue({
        nombre: this.usuarioAEditar.nombre,
        apellidoPaterno: this.usuarioAEditar.apellidoPaterno,
        apellidoMaterno: this.usuarioAEditar.apellidoMaterno,
        tipoDocumento: this.usuarioAEditar.tipoDocumento,
        rut: this.usuarioAEditar.rut,
        dv: this.usuarioAEditar.dv,
        correo: this.usuarioAEditar.correo,
        codigoPin: this.usuarioAEditar.codigoPin,
        roles: this.usuarioAEditar.rolesUsuario.map(ru => ru.rol.id)
      });
    } else if (this.isOpen && !this.editMode) {
      this.usuarioForm.reset({
        tipoDocumento: 'RUT',
        roles: []
      });
    }
  }

  cargarRoles(): void {
    this.personalService.getRoles().subscribe({
      next: (roles) => this.rolesDisponibles = roles,
      error: (err) => console.error('Error al cargar roles', err)
    });
  }

  onRoleChange(event: any): void {
    const selectedOptions = Array.from(event.target.selectedOptions).map((option: any) => option.value);
    this.usuarioForm.get('roles')?.setValue(selectedOptions);
  }

  guardar(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const data = this.usuarioForm.value;

    if (this.editMode && this.usuarioAEditar) {
      this.personalService.updateUsuario(this.usuarioAEditar.id, data).subscribe({
        next: (res) => {
          this.saveSuccess.emit(res);
          this.cerrar();
        },
        error: (err) => console.error('Error al actualizar', err)
      });
    } else {
      this.personalService.createUsuario(data).subscribe({
        next: (res) => {
          this.saveSuccess.emit(res);
          this.cerrar();
        },
        error: (err) => console.error('Error al crear', err)
      });
    }
  }

  cerrar(): void {
    this.usuarioForm.reset({ tipoDocumento: 'RUT', roles: [] });
    this.closeModal.emit();
  }
}
