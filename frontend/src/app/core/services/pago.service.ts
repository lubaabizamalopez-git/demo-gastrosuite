import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MetodoPago {
  id: string;
  ids?: number;
  nombre: string;
  codigo?: string;
  estado: string;
}

export interface RegistrarPagoDTO {
  pedidoId: string;
  turnoId?: string;
  monto: number;
  metodoPagoId: string;
  numeroReferencia?: string;
}

import { apiUrl } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private http = inject(HttpClient);
  private apiUrl = apiUrl('/api/pagos');

  obtenerMetodosPago(): Observable<MetodoPago[]> {
    return this.http.get<MetodoPago[]>(`${this.apiUrl}/metodos`);
  }

  registrarPago(data: RegistrarPagoDTO): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}
