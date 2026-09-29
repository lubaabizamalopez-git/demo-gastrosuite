import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface Usuario {
  id: string;
  ids: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  tipoDocumento: string;
  rut?: string;
  dv?: string;
  correo: string;
  estado: string;
  codigoPin?: string;
  imagenUrl?: string; // Opcional, para controlar las fotos de perfil
  rolesUsuario: { rol: Rol }[];
}

@Injectable({
  providedIn: 'root'
})
export class PersonalService {
  private apiUrl = 'http://localhost:3000/usuarios';

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.apiUrl}/roles`);
  }

  createUsuario(data: any): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, data);
  }

  updateUsuario(id: string, data: any): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, data);
  }

  toggleEstado(id: string): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/estado`, {});
  }
}
