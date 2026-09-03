import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PosModule } from './modules/pos/pos.module';
import { TablesModule } from './modules/tables/tables.module';
import { KdsModule } from './modules/kds/kds.module';
import { PrinterModule } from './modules/printer/printer.module';

@Module({
  imports: [AuthModule, CatalogModule, OrdersModule, PosModule, TablesModule, KdsModule, PrinterModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
