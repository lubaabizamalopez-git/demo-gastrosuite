import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  public colapsado = signal<boolean>(false);

  public toggle(): void {
    this.colapsado.update(v => !v);
  }
}
