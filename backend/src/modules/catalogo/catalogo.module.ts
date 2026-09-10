import { Module } from '@nestjs/common';
import { CatalogoController } from './catalogo.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { CatalogoService } from './catalogo.service';

@Module({
  imports: [PrismaModule],
  controllers: [CatalogoController],
  providers: [CatalogoService]
})
export class CatalogoModule {}
