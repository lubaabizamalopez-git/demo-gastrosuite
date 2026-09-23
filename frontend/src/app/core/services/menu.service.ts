import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  imagen?: string;
  sku?: string;
  activo?: string;
  orden?: number;
  descripcion?: string;
  areaPreparacion?: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  icono?: string;
  orden: number;
  activo?: string;
  productos: Producto[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/v1/catalogos';

  obtenerCategorias(incluirInactivos = false): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/obtener-categorias?incluirInactivos=${incluirInactivos}`);
  }

  // --- CATEGORÍAS ---

  crearCategoria(categoria: Partial<Categoria>): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.apiUrl}/categorias`, categoria);
  }

  actualizarCategoria(id: string, categoria: Partial<Categoria>): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/categorias/${id}`, categoria);
  }

  eliminarCategoria(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categorias/${id}`);
  }

  // --- PRODUCTOS ---

  crearProducto(producto: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}/productos`, producto);
  }

  actualizarProducto(id: string, producto: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/productos/${id}`, producto);
  }

  eliminarProducto(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/productos/${id}`);
  }

  // --- IMÁGENES ---
  subirImagen(archivo: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', archivo);
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload`, formData);
  }
}
