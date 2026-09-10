import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService, Categoria, Producto } from '../../core/services/menu.service';

export interface ProductoFila extends Producto {
  categoriaNombre: string;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit {
  private menuService = inject(MenuService);
  
  productos: ProductoFila[] = [];
  cargando = true;

  ngOnInit() {
    this.menuService.getCategorias().subscribe({
      next: (categorias) => {
        this.productos = categorias.flatMap(cat => 
          cat.productos.map(prod => ({
            ...prod,
            categoriaNombre: cat.nombre
          }))
        );
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar el menú', err);
        this.cargando = false;
      }
    });
  }
}

