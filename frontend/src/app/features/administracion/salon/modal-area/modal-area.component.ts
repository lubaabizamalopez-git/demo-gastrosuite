import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SalonService } from '../../../../core/services/salon.service';

@Component({
  selector: 'app-modal-area',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-area.component.html'
})
export class ModalAreaComponent implements OnInit {
  @Input() area: any = null;
  @Output() cerrar = new EventEmitter<boolean>();
  
  areaForm: FormGroup;
  editMode = false;

  constructor(private fb: FormBuilder, private salonService: SalonService) {
    this.areaForm = this.fb.group({
      nombre: ['', Validators.required],
      orden: [0, Validators.required]
    });
  }

  ngOnInit() {
    if (this.area) {
      this.editMode = true;
      this.areaForm.patchValue(this.area);
    }
  }

  onClose() {
    this.cerrar.emit(false);
  }

  guardar() {
    if (this.areaForm.invalid) return;

    const req = this.editMode
      ? this.salonService.actualizarArea(this.area.ids, this.areaForm.value)
      : this.salonService.crearArea(this.areaForm.value);

    req.subscribe({
      next: () => {
        this.cerrar.emit(true);
      },
      error: (err: any) => {
        console.error(err);
        alert('No se pudo guardar el área');
      }
    });
  }
}
