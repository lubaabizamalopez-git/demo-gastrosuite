import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html'
})
export class ButtonComponent {
  label = input<string>('Bot�n');
  icon = input<string>(''); 
  disabled = input<boolean>(false);
  
  // Kit ampliado de colores operativos para el POS y administraci�n
  color = input<'primary' | 'success' | 'muted' | 'danger'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');

  btnClick = output<void>();

  onClick(): void {
    if (!this.disabled()) {
      this.btnClick.emit();
    }
  }

  get buttonClasses(): string {
    let classes = 'inline-flex items-center justify-center font-bold font-sans transition-all duration-200 cursor-pointer focus:outline-none select-none ';

    // Manejo de tama�os
    const sizeMap = {
      sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
      md: 'px-5 py-2.5 text-sm rounded-xl gap-2 shadow-sm',
      lg: 'w-full px-6 py-3 text-base rounded-xl gap-2.5 shadow-md'
    };
    classes += sizeMap[this.size()] || sizeMap.md;

    // Asignaci�n de colores del nuevo kit operativo
    if (this.disabled()) {
      classes += ' bg-[#FAF7F2] text-[#91857F]/50 border border-[#91857F]/10 cursor-not-allowed';
    } else {
      const colorMap = {
        primary: ' bg-[#FF6B00] hover:bg-[#CC5500] text-white shadow-[#FF6B00]/10',
        success: ' bg-[#E6F4EA] hover:bg-[#D1EAD6] text-[#10B981] border border-[#10B981]/20',
        muted: ' bg-[#FFF5F0] hover:bg-[#FFBD80]/20 text-[#91857F] border border-[#91857F]/25',
        danger: ' bg-transparent hover:bg-red-50 text-red-500 border border-red-200 hover:border-red-300'
      };
      classes += colorMap[this.color()] || colorMap.primary;
    }

    return classes;
  }
}
