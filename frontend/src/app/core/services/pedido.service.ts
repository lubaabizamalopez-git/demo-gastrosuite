import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ItemPedidoDTO {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  areaPreparacion?: string;
  notas?: string;
}

export interface PedidoDTO {
  tipoPedido: string;
  mesaId?: string | null;
  meseroId?: string | null;
  nombreCliente?: string;
  subtotal: number;
  impuestos: number;
  total: number;
  items: ItemPedidoDTO[];
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/pedidos';

  crearPedido(pedido: PedidoDTO): Observable<any> {
    return this.http.post(this.apiUrl, pedido);
  }

  obtenerEstados(canal?: string): Observable<any[]> {
    const url = canal ? `${this.apiUrl}/estados?canal=${canal}` : `${this.apiUrl}/estados`;
    return this.http.get<any[]>(url);
  }
}

