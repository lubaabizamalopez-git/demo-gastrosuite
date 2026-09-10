import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogoModule } from './modules/catalogo/catalogo.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PosModule } from './modules/pos/pos.module';
import { TablesModule } from './modules/tables/tables.module';
import { KdsModule } from './modules/kds/kds.module';
import { PrinterModule } from './modules/printer/printer.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AuthModule, CatalogoModule, OrdersModule, PosModule, TablesModule, KdsModule, PrinterModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
