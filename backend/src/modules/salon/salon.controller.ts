import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { SalonService } from './salon.service';
import { EstadoMesa } from '@prisma/client';

@Controller('api/salon')
export class SalonController {
  constructor(private readonly salonService: SalonService) {}

  // Obtiene el estado actual (mapa visual) de todas las mesas del restaurante
  @Get('mesas')
  async getMesas() {
    return this.salonService.obtenerTodasLasMesas();
  }

  // Cambia el estado de una mesa (ej: de LIBRE a OCUPADA o SUCIA)
  @Put('mesas/:id/estado')
  async updateEstadoMesa(
    @Param('id') id: string,
    @Body('estado') estado: EstadoMesa
  ) {
    return this.salonService.actualizarEstadoMesa(id, estado);
  }

  // Obtiene los salones (áreas) del restaurante
  @Get('areas')
  async getAreas() {
    return this.salonService.obtenerTodasLasAreas();
  }
}
