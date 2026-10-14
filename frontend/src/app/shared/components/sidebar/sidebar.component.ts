import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from './sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  public sidebarService = inject(SidebarService);
  private elementRef = inject(ElementRef);

  public adminMenuAbierto = signal<boolean>(false);
  public modalConstruccionAbierto = signal<boolean>(false);
  public moduloEnConstruccion = signal<string>('');

  public toggleMenuAdmin(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.adminMenuAbierto.update(v => !v);
  }

  public cerrarMenuAdmin(): void {
    this.adminMenuAbierto.set(false);
  }

  public abrirConstruccion(modulo: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.cerrarMenuAdmin();
    this.moduloEnConstruccion.set(modulo);
    this.modalConstruccionAbierto.set(true);
  }

  public cerrarConstruccion(): void {
    this.modalConstruccionAbierto.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.modalConstruccionAbierto()) {
      this.cerrarConstruccion();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.adminMenuAbierto.set(false);
    }
  }
}

