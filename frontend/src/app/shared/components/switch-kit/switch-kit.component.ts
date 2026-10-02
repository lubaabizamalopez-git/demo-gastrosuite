import { Component, model } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gs-switch-kit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './switch-kit.component.html'
})
export class SwitchKitComponent {
  // Signals bidireccionales expuestas para persistencia en Antigravity
  autoBilling = model<boolean>(false);
  deliveryOpen = model<boolean>(false);
  kitchenNotes = model<boolean>(false);
  criticalStock = model<boolean>(false);

  // Paleta de Grises Crom�ticos Intensificados (Design System Estricto):
  // Gris-Naranjo Terracota Inactivo = '#CEBFB5'
  // Gris-Verde Salvia Inactivo = '#CAD6CF'

  toggleAutoBilling(): void {
    this.autoBilling.update(state => !state);
  }

  toggleDeliveryOpen(): void {
    this.deliveryOpen.update(state => !state);
  }

  toggleKitchenNotes(): void {
    this.kitchenNotes.update(state => !state);
  }

  toggleCriticalStock(): void {
    this.criticalStock.update(state => !state);
  }
}
