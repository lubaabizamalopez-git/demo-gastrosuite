import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors, UploadedFile, BadRequestException, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CatalogoService } from './catalogo.service';
import { CrearCategoriaDto } from './dto/crear-categoria.dto';
import { ActualizarCategoriaDto } from './dto/actualizar-categoria.dto';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';

@Controller('api/v1/catalogos')
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get('obtener-categorias')
  async obtenerCategorias(@Query('incluirInactivos') incluirInactivos?: string) {
    return this.catalogoService.obtenerCategoriasConProductos(incluirInactivos === 'true');
  }

  // --- CATEGORÍAS ---

  @Get('categorias/siguiente-orden')
  async obtenerSiguienteOrdenCategoria() {
    const orden = await this.catalogoService.obtenerSiguienteOrdenCategoria();
    return { orden };
  }

  @Post('categorias')
  async crearCategoria(@Body() dto: CrearCategoriaDto) {
    return this.catalogoService.crearCategoria(dto);
  }

  @Put('categorias/:id')
  async actualizarCategoria(@Param('id') id: string, @Body() dto: ActualizarCategoriaDto) {
    return this.catalogoService.actualizarCategoria(id, dto);
  }

  @Delete('categorias/:id')
  async eliminarCategoria(@Param('id') id: string) {
    return this.catalogoService.eliminarCategoria(id);
  }

  // --- PRODUCTOS ---

  @Get('productos/siguiente-orden/:categoriaId')
  async obtenerSiguienteOrdenProducto(@Param('categoriaId') categoriaId: string) {
    const orden = await this.catalogoService.obtenerSiguienteOrdenProducto(categoriaId);
    return { orden };
  }

  @Post('productos')
  async crearProducto(@Body() dto: CrearProductoDto) {
    return this.catalogoService.crearProducto(dto);
  }

  @Put('productos/:id')
  async actualizarProducto(@Param('id') id: string, @Body() dto: ActualizarProductoDto) {
    return this.catalogoService.actualizarProducto(id, dto);
  }

  @Delete('productos/:id')
  async eliminarProducto(@Param('id') id: string) {
    return this.catalogoService.eliminarProducto(id);
  }

  // --- UPLOADS ---
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new BadRequestException('Solo se permiten imágenes'), false);
      }
      cb(null, true);
    }
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    return {
      url: `/uploads/${file.filename}`
    };
  }
}
