import { Controller, Get } from '@nestjs/common';
import { CatalogoService } from './catalogo.service';

@Controller('api/v1/catalogos')
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get('obtener-categorias')
  async obtenerCategorias() {
    return this.catalogoService.obtenerCategoriasConProductos();
  }
}
