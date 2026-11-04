import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type ModoVisual = 'clasico' | 'moderno';

const CLAVE_ALMACENAMIENTO = 'gs-modo-visual';

/**
 * Modo visual de la vitrina (clásico / moderno). Se aplica como atributo data-modo en <html>
 * y se recuerda por navegador. index.html lo aplica antes del primer pintado para evitar parpadeos.
 */
@Injectable({ providedIn: 'root' })
export class ModoVisualService {
  private documento = inject(DOCUMENT);
  private esNavegador = isPlatformBrowser(inject(PLATFORM_ID));

  readonly modo = signal<ModoVisual>(this.leerGuardado());

  alternar(): void {
    this.establecer(this.modo() === 'clasico' ? 'moderno' : 'clasico');
  }

  establecer(modo: ModoVisual): void {
    this.modo.set(modo);
    if (!this.esNavegador) return;
    this.documento.documentElement.setAttribute('data-modo', modo);
    try {
      localStorage.setItem(CLAVE_ALMACENAMIENTO, modo);
    } catch {
      // Almacenamiento bloqueado: el modo dura solo esta visita
    }
  }

  private leerGuardado(): ModoVisual {
    if (!this.esNavegador) return 'clasico';
    try {
      return localStorage.getItem(CLAVE_ALMACENAMIENTO) === 'moderno' ? 'moderno' : 'clasico';
    } catch {
      return 'clasico';
    }
  }
}
