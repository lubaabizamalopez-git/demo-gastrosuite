import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EventsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado al KDS/POS: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  // Método global para notificar a la cocina de un nuevo pedido
  emitNuevoPedido(pedido: any) {
    this.logger.log(`Emitiendo 'nuevo-pedido' a todos los clientes...`);
    this.server?.emit('nuevo-pedido', pedido);
  }

  // Método para actualizar estados de los platos en el KDS
  emitActualizacionKds(data: any) {
    this.logger.log(`Emitiendo 'actualizacion-kds' a todos los clientes...`);
    this.server?.emit('actualizacion-kds', data);
  }
}
