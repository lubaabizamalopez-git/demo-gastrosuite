import { Component, HostListener, computed, forwardRef, input, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface OpcionSelector {
  value: any;
  label: string;
  disabled?: boolean;
}

/** Selector del UI Kit de GastroSuite (basado en app-custom-select de gestión) con búsqueda opcional */
@Component({
  selector: 'app-selector',
  standalone: true,
  imports: [NgClass],
  templateUrl: './selector.component.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectorComponent), multi: true }],
})
export class SelectorComponent implements ControlValueAccessor {
  label = input<string>('');
  icon = input<string>('');
  error = input<string | null>(null);
  options = input<OpcionSelector[]>([]);
  placeholder = input<string>('Seleccionar...');
  buscable = input<boolean>(false);

  isOpen = signal(false);
  selectedValue = signal<any>('');
  busqueda = signal('');
  disabled = signal(false);

  selectedLabel = computed(() => {
    const opcion = this.options().find(opt => opt.value === this.selectedValue());
    return opcion ? opcion.label : this.placeholder();
  });

  opcionesFiltradas = computed(() => {
    const texto = this.normalizar(this.busqueda());
    if (!texto) return this.options();
    return this.options().filter(opt => this.normalizar(opt.label).includes(texto));
  });

  onChange: (valor: any) => void = () => {};
  onTouch: () => void = () => {};

  toggleDropdown(): void {
    if (!this.disabled()) {
      this.isOpen.set(!this.isOpen());
      this.busqueda.set('');
    }
  }

  selectOption(opcion: OpcionSelector): void {
    if (opcion.disabled) return;
    this.selectedValue.set(opcion.value);
    this.isOpen.set(false);
    this.onChange(opcion.value);
    this.onTouch();
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.isOpen.set(false);
  }

  writeValue(valor: any): void {
    this.selectedValue.set(valor ?? '');
  }

  registerOnChange(fn: (valor: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouch = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }
}
