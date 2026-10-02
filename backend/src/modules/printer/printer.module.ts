import { Module } from '@nestjs/common';
import { PrinterController } from './printer.controller';
import { PrinterService } from './printer.service';

@Module({
  controllers: [PrinterController],
  providers: [PrinterService],
  exports: [PrinterService] // Exportamos por si OrdersService quiere imprimir automáticamente
})
export class PrinterModule {}
