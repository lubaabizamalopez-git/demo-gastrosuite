import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-confirmacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-confirmacion.component.html',
  styleUrls: ['./modal-confirmacion.component.scss']
})
export class ModalConfirmacionComponent {
  @Input() item!: { id: string, tipo: 'categoria' | 'producto' | 'categoria_desactivar' | string, nombre: string };
  @Input() mensajePersonalizado?: string | null;
  @Input() titulo: string = 'Confirmar Eliminación';
  @Input() textoBoton: string = 'Eliminar';
  
  @Output() confirmar = new EventEmitter<boolean>();

  onCancelar(): void {
    this.confirmar.emit(false);
  }

  onConfirmar(): void {
    this.confirmar.emit(true);
  }
}
