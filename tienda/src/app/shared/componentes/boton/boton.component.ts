import { Component, input, output } from '@angular/core';

/** Botón del UI Kit de GastroSuite (misma paleta que gestión) */
@Component({
  selector: 'app-boton',
  standalone: true,
  template: `
    <button [type]="tipo()" [class]="clases" [disabled]="disabled() || cargando()" (click)="alHacerClick()">
      @if (cargando()) {
        <i class="fas fa-circle-notch fa-spin text-sm"></i>
      } @else if (icon()) {
        <i [class]="'fas ' + icon() + (size() === 'sm' ? ' text-[11px]' : ' text-sm')"></i>
      }
      <span>{{ label() }}</span>
    </button>
  `,
})
export class BotonComponent {
  label = input<string>('Botón');
  icon = input<string>('');
  disabled = input<boolean>(false);
  cargando = input<boolean>(false);
  tipo = input<'button' | 'submit'>('button');
  color = input<'primary' | 'muted' | 'outline'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');

  btnClick = output<void>();

  alHacerClick(): void {
    if (!this.disabled() && !this.cargando()) {
      this.btnClick.emit();
    }
  }

  get clases(): string {
    let clases = 'inline-flex items-center justify-center font-bold font-sans transition-all duration-200 focus:outline-none select-none ';

    const tamanos = {
      sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
      md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
      lg: 'w-full px-6 py-3.5 text-base rounded-xl gap-2.5',
    };
    clases += tamanos[this.size()];

    if (this.disabled()) {
      return clases + ' bg-[#FAF7F2] text-[#91857F]/50 border border-[#91857F]/10 cursor-not-allowed';
    }

    const colores = {
      primary: ' bg-[#FF6B00] hover:bg-[#CC5500] text-white shadow-sm shadow-[#FF6B00]/20 cursor-pointer',
      muted: ' bg-[#FFF5F0] hover:bg-[#FFBD80]/20 text-[#91857F] border border-[#91857F]/25 cursor-pointer',
      outline: ' bg-transparent hover:bg-[#FFF5F0] text-[#FF6B00] border border-[#FF6B00]/40 cursor-pointer',
    };
    return clases + colores[this.color()];
  }
}
