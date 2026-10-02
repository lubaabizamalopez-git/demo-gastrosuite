import { Component, input, forwardRef, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
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
  // Par�metros de personalizaci�n mediante Angular Signals
  label = input<string>('');
  icon = input<string>(''); 
  error = input<string | null>(null);
  options = input<SelectOption[]>([]);

  // Estados reactivos internos del componente
  isOpen = signal<boolean>(false);
  selectedValue = signal<any>('');
  selectedLabel = signal<string>('Selecciona una opci�n...');
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
    this.selectedLabel.set(option.label);
    this.isOpen.set(false);
    this.onChange(option.value);
    this.onTouch();
  }

  // Cierra autom�ticamente el panel si haces click en cualquier otra parte fuera del dropdown
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    this.isOpen.set(false);
  }

  // M�todos requeridos por la interfaz ControlValueAccessor de Angular
  writeValue(val: any): void {
    this.selectedValue.set(val || '');
    const matchedOption = this.options().find(opt => opt.value === val);
    this.selectedLabel.set(matchedOption ? matchedOption.label : 'Selecciona una opci�n...');
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouch = fn; }
  setDisabledState?(isDisabled: boolean): void { this.disabled.set(isDisabled); }
}
