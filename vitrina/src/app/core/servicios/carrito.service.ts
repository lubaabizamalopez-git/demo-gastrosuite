import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ItemCarrito, Producto } from '../modelos/vitrina.model';

/** Carrito de compras por restaurante, persistido en el navegador */
@Injectable({ providedIn: 'root' })
export class CarritoService {
  private esNavegador = isPlatformBrowser(inject(PLATFORM_ID));
  private slug = '';

  readonly items = signal<ItemCarrito[]>([]);
  readonly abierto = signal(false);

  readonly cantidadTotal = computed(() => this.items().reduce((acc, i) => acc + i.cantidad, 0));
  readonly totalProductos = computed(() => this.items().reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0));

  /** Carga el carrito guardado del restaurante indicado */
  usarRestaurante(slug: string): void {
    if (this.slug === slug) return;
    this.slug = slug;
    this.items.set(this.leer());
  }

  agregar(producto: Producto, cantidad = 1, notas = ''): void {
    this.items.update(items => {
      const existente = items.find(i => i.producto.id === producto.id && i.notas === notas);
      if (existente) {
        return items.map(i => (i === existente ? { ...i, cantidad: Math.min(i.cantidad + cantidad, 50) } : i));
      }
      return [...items, { producto, cantidad, notas }];
    });
    this.guardar();
  }

  cambiarCantidad(item: ItemCarrito, cantidad: number): void {
    if (cantidad <= 0) {
      this.quitar(item);
      return;
    }
    this.items.update(items => items.map(i => (i === item ? { ...i, cantidad: Math.min(cantidad, 50) } : i)));
    this.guardar();
  }

  quitar(item: ItemCarrito): void {
    this.items.update(items => items.filter(i => i !== item));
    this.guardar();
  }

  vaciar(): void {
    this.items.set([]);
    this.guardar();
  }

  private get clave(): string {
    return `gs-carrito-${this.slug}`;
  }

  private leer(): ItemCarrito[] {
    if (!this.esNavegador) return [];
    try {
      return JSON.parse(localStorage.getItem(this.clave) ?? '[]');
    } catch {
      return [];
    }
  }

  private guardar(): void {
    if (!this.esNavegador) return;
    try {
      localStorage.setItem(this.clave, JSON.stringify(this.items()));
    } catch {
      // Sin almacenamiento disponible: el carrito vive solo en memoria
    }
  }
}
