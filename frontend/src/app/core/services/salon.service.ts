import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AreaSalon {
  id: string;
  ids: number;
  nombre: string;
  orden: number;
  mesas?: Mesa[];
}

export interface Mesa {
  id: string;
  ids: number;
  areaSalonId: string;
  numeroMesa: string;
  capacidad: number;
  estado: string;
  posX: number;
  posY: number;
  areaSalon?: AreaSalon;
}

@Injectable({
  providedIn: 'root'
})
export class SalonService {
  private apiUrl = 'http://localhost:3000/salon';

  constructor(private http: HttpClient) {}

  // ==========================
  // ÁREAS
  // ==========================
  obtenerAreas(): Observable<AreaSalon[]> {
    return this.http.get<AreaSalon[]>(`${this.apiUrl}/areas`);
  }

  crearArea(data: { nombre: string; orden?: number }): Observable<AreaSalon> {
    return this.http.post<AreaSalon>(`${this.apiUrl}/areas`, data);
  }

  actualizarArea(ids: number, data: { nombre?: string; orden?: number }): Observable<AreaSalon> {
    return this.http.put<AreaSalon>(`${this.apiUrl}/areas/${ids}`, data);
  }

  eliminarArea(ids: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/areas/${ids}`);
  }

  // ==========================
  // MESAS
  // ==========================
  obtenerMesas(): Observable<Mesa[]> {
    return this.http.get<Mesa[]>(`${this.apiUrl}/mesas`);
  }

  obtenerMesasPorArea(areaIds: number): Observable<Mesa[]> {
    return this.http.get<Mesa[]>(`${this.apiUrl}/areas/${areaIds}/mesas`);
  }

  crearMesa(data: { areaSalonId: string; numeroMesa: string; capacidad?: number; posX?: number; posY?: number }): Observable<Mesa> {
    return this.http.post<Mesa>(`${this.apiUrl}/mesas`, data);
  }

  actualizarMesa(ids: number, data: Partial<Mesa>): Observable<Mesa> {
    return this.http.put<Mesa>(`${this.apiUrl}/mesas/${ids}`, data);
  }

  eliminarMesa(ids: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/mesas/${ids}`);
  }
}
