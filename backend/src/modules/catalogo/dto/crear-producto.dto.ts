import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CrearProductoDto {
  @IsUUID()
  @IsNotEmpty()
  categoriaId: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsNotEmpty()
  precio: number;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  imagen?: string;

  @IsString()
  @IsOptional()
  activo?: string;

  @IsString()
  @IsOptional()
  areaPreparacion?: 'COCINA' | 'BAR' | 'POSTRES' | 'PARRILLA';

  @IsNumber()
  @IsOptional()
  orden?: number;
}
