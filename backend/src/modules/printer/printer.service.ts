import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PrinterService {
  private readonly logger = new Logger(PrinterService.name);

  async imprimirTicket(pedidoId: string, total: number, items: any[] = []) {
    // Aquí a futuro se integra una librería real como 'escpos' o 'node-thermal-printer'
    // Por ahora simulamos la impresión directamente en la consola para la Demo
    this.logger.log(`\n
    =================================
             GASTRO SUITE            
    =================================
    Ticket: #${String(pedidoId).substring(0, 8)}
    Fecha: ${new Date().toLocaleString()}
    ---------------------------------
    ${items.map(i => `${i.cantidad || 1}x ${String(i.nombre).padEnd(20)} $${i.precio || 0}`).join('\n    ')}
    ---------------------------------
    TOTAL:                   $${total}
    =================================
    ¡Gracias por su preferencia!     
    =================================\n
    `);
    
    return { success: true, message: 'Ticket enviado a la tiquetera térmica de caja' };
  }

  async imprimirComanda(pedidoId: string, items: any[] = []) {
    this.logger.warn(`\n
    *** COMANDA DE COCINA ***
    Pedido: #${String(pedidoId).substring(0, 8)}
    Hora: ${new Date().toLocaleTimeString()}
    ---------------------------------
    ${items.map(i => `[ ] ${i.cantidad || 1}x ${i.nombre} ${i.notas ? '('+i.notas+')' : ''}`).join('\n    ')}
    ---------------------------------\n
    `);
    
    return { success: true, message: 'Comanda enviada a la impresora de cocina' };
  }
}
