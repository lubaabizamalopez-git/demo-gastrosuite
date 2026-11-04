import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, IsBoolean } from 'class-validator';

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
  estado?: string;

  @IsString()
  @IsOptional()
  areaPreparacion?: 'COCINA' | 'BAR' | 'POSTRES' | 'PARRILLA';

  @IsNumber()
  @IsOptional()
  orden?: number;

  // Publicado en la vitrina online
  @IsBoolean()
  @IsOptional()
  visibleOnline?: boolean;
}
