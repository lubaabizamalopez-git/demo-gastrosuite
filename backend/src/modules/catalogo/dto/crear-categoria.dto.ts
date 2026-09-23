import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CrearCategoriaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  icono?: string;

  @IsNumber()
  @IsOptional()
  orden?: number;

  @IsString()
  @IsOptional()
  activo?: string;
}
