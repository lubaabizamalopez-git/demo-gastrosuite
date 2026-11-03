import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../constantes/api.constantes';
import {
  Categoria, Comuna, CrearPedidoRequest, CrearPedidoResponse, Empresa, IniciarPagoResponse, Seguimiento,
} from '../modelos/tienda.model';

@Injectable({ providedIn: 'root' })
export class TiendaService {
  private http = inject(HttpClient);
  private base = apiUrl('/api/v1/tienda');

  obtenerEmpresa(slug: string): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.base}/${slug}`);
  }

  obtenerMenu(slug: string): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.base}/${slug}/menu`);
  }

  obtenerComunas(): Observable<Comuna[]> {
    return this.http.get<Comuna[]>(`${this.base}/comunas`);
  }

  crearPedido(slug: string, pedido: CrearPedidoRequest): Observable<CrearPedidoResponse> {
    return this.http.post<CrearPedidoResponse>(`${this.base}/${slug}/pedidos`, pedido);
  }

  iniciarPago(slug: string, codigo: string): Observable<IniciarPagoResponse> {
    return this.http.post<IniciarPagoResponse>(`${this.base}/${slug}/pedidos/${codigo}/pagar`, {});
  }

  obtenerSeguimiento(slug: string, codigo: string): Observable<Seguimiento> {
    return this.http.get<Seguimiento>(`${this.base}/${slug}/pedidos/${codigo}`);
  }

  /** Envía al cliente al formulario de pago de Webpay (POST con token_ws) */
  redirigirAWebpay(pago: IniciarPagoResponse): void {
    const formulario = document.createElement('form');
    formulario.method = 'POST';
    formulario.action = pago.url;

    const campo = document.createElement('input');
    campo.type = 'hidden';
    campo.name = 'token_ws';
    campo.value = pago.token;

    formulario.appendChild(campo);
    document.body.appendChild(formulario);
    formulario.submit();
  }
}
