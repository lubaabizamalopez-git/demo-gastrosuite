import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../../../core/services/menu.service';

import { resolverUrlImagen } from '../../../../core/constants/api.constants';

@Component({
  selector: 'app-modal-detalle-producto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-detalle-producto.component.html',
  styleUrls: ['./modal-detalle-producto.component.scss']
})
export class ModalDetalleProductoComponent {
  @Input() producto!: Producto;
  @Output() cerrar = new EventEmitter<void>();

  onCerrar(): void {
    this.cerrar.emit();
  }

  getImageUrl(url: string | undefined): string {
    return resolverUrlImagen(url);
  }
}
