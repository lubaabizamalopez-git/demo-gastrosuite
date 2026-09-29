import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SalonService, Mesa } from '../../../../core/services/salon.service';

@Component({
  selector: 'app-modal-mesa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-mesa.component.html'
})
export class ModalMesaComponent implements OnInit {
  @Input() mesa: Mesa | null = null;
  @Input() areaId: string | undefined;
  @Output() cerrar = new EventEmitter<boolean>();
  
  mesaForm: FormGroup;
  editMode = false;

  constructor(private fb: FormBuilder, private salonService: SalonService) {
    this.mesaForm = this.fb.group({
      numeroMesa: ['', Validators.required],
      capacidad: [4, [Validators.required, Validators.min(1)]],
      estado: ['LIBRE']
    });
  }

  ngOnInit() {
    if (this.mesa) {
      this.editMode = true;
      this.mesaForm.patchValue({
        numeroMesa: this.mesa.numeroMesa,
        capacidad: this.mesa.capacidad,
        estado: this.mesa.estado
      });
    }
  }

  onClose() {
    this.cerrar.emit(false);
  }

  guardar() {
    if (this.mesaForm.invalid) return;
    
    if (this.editMode && this.mesa) {
      this.salonService.actualizarMesa(this.mesa.ids, this.mesaForm.value).subscribe({
        next: () => {
          this.cerrar.emit(true);
        },
        error: (err: any) => {
          console.error(err);
          alert('No se pudo actualizar la mesa');
        }
      });
    } else {
      const data = { ...this.mesaForm.value, areaSalonId: this.areaId };
      this.salonService.crearMesa(data).subscribe({
        next: () => {
          this.cerrar.emit(true);
        },
        error: (err: any) => {
          console.error(err);
          alert('No se pudo crear la mesa');
        }
      });
    }
  }
}
