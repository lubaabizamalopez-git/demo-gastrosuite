import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SalonController } from './salon.controller';
import { SalonService } from './salon.service';

@Module({
  imports: [PrismaModule],
  controllers: [SalonController],
  providers: [SalonService]
})
export class SalonModule {}
