import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './ordenes.component.html',
  styleUrl: './ordenes.component.scss'
})
export class OrdenesComponent implements OnInit {
  private http = inject(HttpClient);
  
  pedidos: any[] = [];
  cargando = true;

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.http.get<any[]>('http://localhost:3000/api/pedidos').subscribe({
      next: (data) => {
        this.pedidos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos', err);
        this.cargando = false;
      }
    });
  }

  getNuevas() { return this.pedidos.filter(p => p.estado === 'PENDIENTE').length; }
  getPreparando() { return this.pedidos.filter(p => p.estado === 'EN_COCINA').length; }
  getListas() { return this.pedidos.filter(p => p.estado === 'LISTO').length; }
  getEntregadas() { return this.pedidos.filter(p => p.estado === 'ENTREGADO').length; }
}
