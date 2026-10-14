import { Component, input, forwardRef, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-select.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true
    }
  ]
})
export class CustomSelectComponent implements ControlValueAccessor {
  // Parámetros de personalización mediante Angular Signals
  label = input<string>('');
  icon = input<string>(''); 
  error = input<string | null>(null);
  options = input<SelectOption[]>([]);
  placeholder = input<string>('Seleccionar...');

  // Estados reactivos internos del componente
  isOpen = signal<boolean>(false);
  selectedValue = signal<any>('');
  
  // Computamos la etiqueta basándonos en el valor seleccionado y las opciones actuales
  selectedLabel = computed(() => {
    const matchedOption = this.options().find(opt => opt.value === this.selectedValue());
    return matchedOption ? matchedOption.label : this.placeholder();
  });

  disabled = signal<boolean>(false);

  // Callbacks para enlazar con FormBuilder de Angular
  onChange: any = () => {};
  onTouch: any = () => {};

  toggleDropdown(): void {
    if (!this.disabled()) {
      this.isOpen.set(!this.isOpen());
    }
  }

  selectOption(option: SelectOption): void {
    this.selectedValue.set(option.value);
    this.isOpen.set(false);
    this.onChange(option.value);
    this.onTouch();
  }

  // Cierra automáticamente el panel si haces click en cualquier otra parte fuera del dropdown
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    this.isOpen.set(false);
  }

  // Métodos requeridos por la interfaz ControlValueAccessor de Angular
  writeValue(val: any): void {
    this.selectedValue.set(val !== undefined ? val : '');
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouch = fn; }
  setDisabledState?(isDisabled: boolean): void { this.disabled.set(isDisabled); }
}
