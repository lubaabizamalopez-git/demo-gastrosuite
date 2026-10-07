import { Module } from '@nestjs/common';
import { GeografiaService } from './geografia.service';
import { GeografiaController } from './geografia.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GeografiaController],
  providers: [GeografiaService],
  exports: [GeografiaService],
})
export class GeografiaModule {}
