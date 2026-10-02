import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-card.component.html'
})
export class KpiCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  icon = input<string>('fa-circle');
  iconLetter = input<string>(''); 
  type = input<'brand' | 'success' | 'danger' | 'warning'>('brand');

  get wrapperClasses(): string {
    // Subimos la presencia del gradiente en la esquina superior derecha (to-xx/15) para mayor viveza
    const borders = {
      brand: 'border-[#91857F]/15 bg-gradient-to-br from-white via-white to-[#FFF5F0]/60',
      success: 'border-[#91857F]/15 bg-gradient-to-br from-white via-white to-[#E6F4EA]/60',
      danger: 'border-[#91857F]/15 bg-gradient-to-br from-white via-white to-red-50/40',
      warning: 'border-[#91857F]/15 bg-gradient-to-br from-white via-white to-[#FFF9E6]/60'
    };
    return `bg-white rounded-2xl border border-solid p-4 flex items-center gap-3.5 relative overflow-hidden shadow-sm shadow-black/5 ${borders[this.type()]}`;
  }

  get iconClasses(): string {
    const backgrounds = {
      
brand: 'bg-[#FFF5F0] text-[#FF6B00]',
      success: 'bg-[#E6F4EA] text-[#10B981]',
      danger: 'bg-red-50 text-red-500',
      warning: 'bg-[#FFF9E6] text-[#CC5500]'
    };
    return `w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm select-none ${backgrounds[this.type()]}`;
  }
}
