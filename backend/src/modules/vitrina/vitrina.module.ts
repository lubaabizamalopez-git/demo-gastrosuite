import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { VitrinaController } from './vitrina.controller';
import { VitrinaService } from './vitrina.service';
import { WebpayService } from './webpay.service';

@Module({
  imports: [PrismaModule],
  controllers: [VitrinaController],
  providers: [VitrinaService, WebpayService],
})
export class VitrinaModule {}
