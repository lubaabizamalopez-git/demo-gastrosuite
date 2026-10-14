import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GeografiaService } from './geografia.service';

@Controller(['geografia', 'api/v1/geografia'])
export class GeografiaController {
  constructor(private readonly geografiaService: GeografiaService) {}

  @Get('regiones')
  async getRegiones() {
    return this.geografiaService.getRegiones();
  }

  @Get('regiones/:id/ciudades')
  async getCiudadesPorRegion(@Param('id', ParseIntPipe) id: number) {
    return this.geografiaService.getCiudadesPorRegion(id);
  }

  @Get('ciudades/:id/comunas')
  async getComunasPorCiudad(@Param('id', ParseIntPipe) id: number) {
    return this.geografiaService.getComunasPorCiudad(id);
  }
}
