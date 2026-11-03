import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TiendaController } from './tienda.controller';
import { TiendaService } from './tienda.service';
import { WebpayService } from './webpay.service';

@Module({
  imports: [PrismaModule],
  controllers: [TiendaController],
  providers: [TiendaService, WebpayService],
})
export class TiendaModule {}
