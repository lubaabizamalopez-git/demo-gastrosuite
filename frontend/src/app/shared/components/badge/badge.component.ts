import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeStatus =
  | 'success' | 'warning' | 'info' | 'danger' | 'brand' | 'muted'
  | 'INGRESADO' | 'EN_COCINA' | 'LISTO_MESA' | 'LISTO_RETIRO' | 'LISTO_ENVIO'
  | 'SERVIDO' | 'EN_CAMINO' | 'ENTREGADO' | 'PAGADO_CERRADO' | 'CANCELADO'
  | 'RETRASADO'
  | string;

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html'
})
export class BadgeComponent {
  label = input.required<string>();
  icon = input<string>(''); 
  status = input<BadgeStatus>('muted');
  shape = input<'suave' | 'redonda'>('suave');

  get badgeClasses(): string {
    let classes = 'inline-flex items-center font-bold font-sans px-2.5 py-0.5 text-[11px] gap-1.5 border border-solid select-none ';
    
    // Forma adaptativa (sin alterar forma ni tamaño base)
    classes += this.shape() === 'redonda' ? 'rounded-full px-3' : 'rounded-lg';

    const statusMap: Record<string, string> = {
      // Genéricos UI Kit
      success: ' bg-[#E6F4EA] text-[#10B981] border-[#10B981]/20',
      warning: ' bg-[#FFF9E6] text-[#CC5500] border-[#F59E0B]/20',
      info: ' bg-[#EBF5FF] text-[#3B82F6] border-[#3B82F6]/20',
      danger: ' bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]/20',
      brand: ' bg-[#FFF5F0] text-[#FF6B00] border-[#FF6B00]/20',
      muted: ' bg-[#FAF7F2] text-[#91857F] border-[#91857F]/25',

      // Matriz de Colores Hexadecimales para Estados de Pedidos
      INGRESADO: ' bg-[#FFF5F0] text-[#FF6B00] border-[#FFBD80]',
      EN_COCINA: ' bg-[#F0F7F4] text-[#2D6A4F] border-[#B7E4C7]',
      LISTO_MESA: ' bg-[#FFF5F0] text-[#CC5500] border-[#FFBD80] ring-2 ring-[#FF6B0033]',
      LISTO_RETIRO: ' bg-[#FFF9E6] text-[#B45309] border-[#FDE68A]',
      LISTO_ENVIO: ' bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]',
      SERVIDO: ' bg-[#E6F4EA] text-[#137333] border-[#A8DADC]',
      EN_CAMINO: ' bg-[#F1F5F9] text-[#1E293B] border-[#CBD5E1]',
      ENTREGADO: ' bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]',
      PAGADO_CERRADO: ' bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0]',
      CANCELADO: ' bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]',
      RETRASADO: ' bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5] ring-2 ring-[#EF44444D] animate-pulse',

      // Mapeos de compatibilidad
      PENDIENTE: ' bg-[#FFF5F0] text-[#FF6B00] border-[#FFBD80]',
      LISTO: ' bg-[#FFF5F0] text-[#CC5500] border-[#FFBD80] ring-2 ring-[#FF6B0033]',
      PAGADO: ' bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0]'
    };

    return classes + (statusMap[this.status()] || statusMap['muted']);
  }
}
