import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
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
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { SalonModule } from './modules/salon/salon.module';
import { EventsModule } from './modules/events/events.module';
import { GeografiaModule } from './modules/geografia/geografia.module';
import { PagosModule } from './modules/pagos/pagos.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule, CatalogoModule, OrdersModule, PosModule, TablesModule, KdsModule, PrinterModule, PrismaModule, UsuariosModule, SalonModule, EventsModule, GeografiaModule, PagosModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
