import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { apiUrl } from '../../../core/constants/api.constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginMode = signal<'admin' | 'pos'>('pos');
  
  // Variables estáticas para acelerar el demo según requerimiento
  email = signal('admin@gastrosuite.com');
  password = signal('123456');
  
  // Para el modo POS pre-llenamos con 1234
  pin = signal('1234');
  
  private router = inject(Router);
  private http = inject(HttpClient);
  
  setMode(mode: 'admin' | 'pos') {
    this.loginMode.set(mode);
    // Auto-rellenar para no escribir durante la demo
    if (mode === 'pos') this.pin.set('1234');
  }
  
  appendPin(num: number) {
    if (this.pin().length < 4) {
      this.pin.update(p => p + num);
      if (this.pin().length === 4) {
        this.loginPos();
      }
    }
  }
  
  clearPin() {
    this.pin.set('');
  }
  
  loginAdmin() {
    const payload = { correo: this.email(), clave: this.password() };
    this.http.post(apiUrl('/api/auth/login'), payload).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));
        this.router.navigate(['/pos']);
      },
      error: (err) => alert('Error: Credenciales inválidas')
    });
  }
  
  loginPos() {
    const payload = { pin: this.pin() };
    this.http.post(apiUrl('/api/auth/login-pin'), payload).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));
        this.router.navigate(['/pos']);
      },
      error: (err) => {
        alert('Error: PIN inválido');
        this.clearPin();
      }
    });
  }
}
