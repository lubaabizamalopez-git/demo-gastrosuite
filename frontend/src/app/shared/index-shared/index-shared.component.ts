import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonComponent } from '../components/button/button.component';
import { BadgeComponent } from '../components/badge/badge.component';
import { CustomSelectComponent } from '../components/custom-select/custom-select.component';
import { KpiCardComponent } from '../components/kpi-card/kpi-card.component';
import { ViewHeaderComponent } from '../components/view-header/view-header.component';
import { SectionHeaderComponent } from '../components/section-header/section-header.component';
import { SearchBarComponent } from '../components/search-bar/search-bar.component';
import { FilterDrawerComponent } from '../components/filter-drawer/filter-drawer.component';
import { AlertModalComponent } from '../components/alert-modal/alert-modal.component';
import { SwitchKitComponent } from '../components/switch-kit/switch-kit.component';
import { BootstrapAlertsComponent } from '../components/bootstrap-alerts/bootstrap-alerts.component';
import { GourmetSpinnerComponent } from '../components/gourmet-spinner/gourmet-spinner.component';

@Component({
  selector: 'app-index-shared',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    BadgeComponent,
    CustomSelectComponent,
    KpiCardComponent,
    ViewHeaderComponent,
    SectionHeaderComponent,
    SearchBarComponent,
    FilterDrawerComponent,
    AlertModalComponent,
    SwitchKitComponent,
    BootstrapAlertsComponent,
    GourmetSpinnerComponent
  ],
  templateUrl: './index-shared.component.html',
  styleUrls: ['./index-shared.component.scss']
})
export class IndexSharedComponent {
  mockOptions = [
    { value: 1, label: 'Opción 1' },
    { value: 2, label: 'Opción 2' },
    { value: 3, label: 'Opción 3' }
  ];

  isDrawerOpen = false;
  isModalOpen = false;
}
