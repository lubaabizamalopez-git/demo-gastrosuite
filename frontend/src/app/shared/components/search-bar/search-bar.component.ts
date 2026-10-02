import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html'
})
export class SearchBarComponent {
  placeholder = input<string>('Buscar en el listado...');
  showFilterButton = input<boolean>(true);

  searchChange = output<string>();
  filterToggle = output<boolean>(); // Emite si los filtros est�n abiertos o cerrados

  query = signal<string>('');
  
  // Estado que controla la visibilidad del panel inferior de filtros
  isExpanded = signal<boolean>(false);

  onInputValueChange(value: string): void {
    this.query.set(value);
    this.searchChange.emit(value);
  }

  toggleFilters(): void {
    this.isExpanded.set(!this.isExpanded());
    this.filterToggle.emit(this.isExpanded());
  }
}
