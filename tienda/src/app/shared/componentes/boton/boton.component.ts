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
      return clases + ' bg-neutral-bg text-text-muted/50 border border-text-muted/10 cursor-not-allowed';
    }

    const colores = {
      primary: ' bg-brand-primary hover:bg-brand-dark text-brand-contraste shadow-sm shadow-brand-primary/20 cursor-pointer',
      muted: ' bg-brand-cream hover:bg-brand-soft/20 text-text-muted border border-text-muted/25 cursor-pointer',
      outline: ' bg-transparent hover:bg-brand-cream text-brand-primary border border-brand-primary/40 cursor-pointer',
    };
    return clases + colores[this.color()];
  }
}
