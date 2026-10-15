import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Region {
  id: number;
  nombre: string;
}

export interface Ciudad {
  id: number;
  nombre: string;
}

export interface Comuna {
  id: number;
  nombre: string;
}

import { apiUrl } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class GeografiaService {
  private apiUrl = apiUrl('/api/geografia');

  constructor(private http: HttpClient) {}

  getRegiones(): Observable<Region[]> {
    return this.http.get<any[]>(`${this.apiUrl}/regiones`).pipe(
      map(res => res.map(r => ({ id: r.id_region, nombre: r.descripcion })))
    );
  }

  getCiudadesPorRegion(regionId: number): Observable<Ciudad[]> {
    return this.http.get<any[]>(`${this.apiUrl}/regiones/${regionId}/ciudades`).pipe(
      map(res => res.map(c => ({ id: c.id_ciudad, nombre: c.descripcion })))
    );
  }

  getComunasPorCiudad(ciudadId: number): Observable<Comuna[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ciudades/${ciudadId}/comunas`).pipe(
      map(res => res.map(c => ({ id: c.id_comuna, nombre: c.descripcion })))
    );
  }
}
