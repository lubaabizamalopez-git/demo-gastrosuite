import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { SalonService } from './salon.service';

@Controller('salon')
export class SalonController {
  constructor(private readonly salonService: SalonService) {}

  // ==========================
  // ÁREAS DE SALÓN
  // ==========================
  @Get('areas')
  obtenerAreas() {
    return this.salonService.obtenerAreas();
  }

  @Post('areas')
  crearArea(@Body() data: { nombre: string; orden?: number }) {
    return this.salonService.crearArea(data);
  }

  @Put('areas/:ids')
  actualizarArea(@Param('ids', ParseIntPipe) ids: number, @Body() data: { nombre?: string; orden?: number }) {
    return this.salonService.actualizarArea(ids, data);
  }

  @Delete('areas/:ids')
  eliminarArea(@Param('ids', ParseIntPipe) ids: number) {
    return this.salonService.eliminarArea(ids);
  }

  // ==========================
  // MESAS
  // ==========================
  @Get('mesas')
  obtenerMesas() {
    return this.salonService.obtenerMesas();
  }

  @Get('areas/:areaIds/mesas')
  obtenerMesasPorArea(@Param('areaIds', ParseIntPipe) areaIds: number) {
    return this.salonService.obtenerMesasPorArea(areaIds);
  }

  @Post('mesas')
  crearMesa(@Body() data: { areaSalonId: string; numeroMesa: string; capacidad?: number; posX?: number; posY?: number }) {
    return this.salonService.crearMesa(data);
  }

  @Put('mesas/:ids')
  actualizarMesa(@Param('ids', ParseIntPipe) ids: number, @Body() data: { numeroMesa?: string; capacidad?: number; estado?: any; posX?: number; posY?: number }) {
    return this.salonService.actualizarMesa(ids, data);
  }

  @Delete('mesas/:ids')
  eliminarMesa(@Param('ids', ParseIntPipe) ids: number) {
    return this.salonService.eliminarMesa(ids);
  }
}
