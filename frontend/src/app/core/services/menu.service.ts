import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  sku: string;
  imagen: string;
  activo: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
  productos: Producto[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/catalog';

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }
}
