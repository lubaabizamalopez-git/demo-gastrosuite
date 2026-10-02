import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html'
})
export class BadgeComponent {
  label = input.required<string>();
  icon = input<string>(''); 
  status = input<'success' | 'warning' | 'info' | 'danger' | 'brand' | 'muted'>('muted');
  shape = input<'suave' | 'redonda'>('suave');

  get badgeClasses(): string {
    let classes = 'inline-flex items-center font-bold font-sans px-2.5 py-0.5 text-[11px] gap-1.5 border border-solid select-none ';
    
    // Forma adaptativa
    classes += this.shape() === 'redonda' ? 'rounded-full px-3' : 'rounded-lg';

    const statusMap = {
      success: ' bg-[#E6F4EA] text-[#10B981] border-[#10B981]/20',
      warning: ' bg-[#FFF9E6] text-[#CC5500] border-[#F59E0B]/20',
      info: ' bg-[#EBF5FF] text-[#3B82F6] border-[#3B82F6]/20',
      danger: ' bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]/20',
      brand: ' bg-[#FFF5F0] text-[#FF6B00] border-[#FF6B00]/20',
      muted: ' bg-[#FAF7F2] text-[#91857F] border-[#91857F]/25'
    };

    return classes + (statusMap[this.status()] || statusMap.muted);
  }
}
