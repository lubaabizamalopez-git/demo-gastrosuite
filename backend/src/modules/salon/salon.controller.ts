import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { SalonService } from './salon.service';
import { EstadoMesa } from '@prisma/client';

@Controller(['api/salon', 'salon', 'api/v1/salon'])
export class SalonController {
  constructor(private readonly salonService: SalonService) {}

  // ==========================
  // ÁREAS DE SALÓN
  // ==========================
  @Get('areas')
  async getAreas() {
    return this.salonService.obtenerTodasLasAreas();
  }

  @Post('areas')
  async crearArea(@Body() body: { nombre: string; orden?: number }) {
    return this.salonService.crearArea(body);
  }

  @Put('areas/:ids')
  async actualizarArea(
    @Param('ids', ParseIntPipe) ids: number,
    @Body() body: { nombre?: string; orden?: number }
  ) {
    return this.salonService.actualizarArea(ids, body);
  }

  @Delete('areas/:ids')
  async eliminarArea(@Param('ids', ParseIntPipe) ids: number) {
    return this.salonService.eliminarArea(ids);
  }

  @Get('areas/:areaIds/mesas')
  async getMesasPorArea(@Param('areaIds', ParseIntPipe) areaIds: number) {
    return this.salonService.obtenerMesasPorArea(areaIds);
  }

  // ==========================
  // MESAS
  // ==========================
  @Get('mesas')
  async getMesas() {
    return this.salonService.obtenerTodasLasMesas();
  }

  @Post('mesas')
  async crearMesa(@Body() body: {
    areaSalonId: string;
    numeroMesa: string;
    capacidad?: number;
    posX?: number;
    posY?: number;
    estado?: EstadoMesa;
  }) {
    return this.salonService.crearMesa(body);
  }

  @Put('mesas/:ids')
  async actualizarMesa(
    @Param('ids', ParseIntPipe) ids: number,
    @Body() body: any
  ) {
    return this.salonService.actualizarMesa(ids, body);
  }

  @Put('mesas/:id/estado')
  async updateEstadoMesa(
    @Param('id') id: string,
    @Body('estado') estado: EstadoMesa
  ) {
    return this.salonService.actualizarEstadoMesa(id, estado);
  }

  @Delete('mesas/:ids')
  async eliminarMesa(@Param('ids', ParseIntPipe) ids: number) {
    return this.salonService.eliminarMesa(ids);
  }
}
