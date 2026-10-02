import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  
selector: 'gs-bootstrap-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bootstrap-alerts.component.html'
})
export class BootstrapAlertsComponent {
  // Estados de visibilidad independientes para cada alerta
  showAlertSuccessLong = signal<boolean>(true);
  showAlertInfo = signal<boolean>(true);
  showAlertSecondary = signal<boolean>(true);
  showAlertDanger = signal<boolean>(true);
  showAlertWarning = signal<boolean>(true);
  showAlertLight = signal<boolean>(true);
  showAlertDark = signal<boolean>(true);

  // M�todos de cierre express
  closeAlert(alertType: string): void {
    switch (alertType) {
      case 'success-long': this.showAlertSuccessLong.set(false); break;
      case 'info': this.showAlertInfo.set(false); break;
      case 'secondary': this.showAlertSecondary.set(false); break;
      case 'danger': this.showAlertDanger.set(false); break;
      case 'warning': this.showAlertWarning.set(false); break;
      case 'light': this.showAlertLight.set(false); break;
      case 'dark': this.showAlertDark.set(false); break;
    }
  }
}
