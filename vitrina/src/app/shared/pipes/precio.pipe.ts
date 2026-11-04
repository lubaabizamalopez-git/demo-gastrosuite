import { Pipe, PipeTransform } from '@angular/core';

const formato = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

/** Formatea montos en pesos chilenos: 13500 -> $13.500 */
@Pipe({ name: 'precio', standalone: true })
export class PrecioPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    return formato.format(Number(valor ?? 0));
  }
}
