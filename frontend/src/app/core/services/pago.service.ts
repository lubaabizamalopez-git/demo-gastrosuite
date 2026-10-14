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

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/pagos';

  obtenerMetodosPago(): Observable<MetodoPago[]> {
    return this.http.get<MetodoPago[]>(`${this.apiUrl}/metodos`);
  }

  registrarPago(data: RegistrarPagoDTO): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}
