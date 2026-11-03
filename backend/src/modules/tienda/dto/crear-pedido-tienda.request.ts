import { Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayMinSize, IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString,
  IsUUID, MaxLength, Max, Min, ValidateNested,
} from 'class-validator';

export class ClienteTiendaRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  apellido?: string;

  @IsEmail()
  @MaxLength(150)
  correo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  telefono: string;
}

export class DireccionTiendaRequest {
  @IsInt()
  @IsOptional()
  comunaId?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  calle: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  numero: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  depto?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  referencia?: string;
}

export class ItemTiendaRequest {
  @IsUUID()
  productoId: string;

  @IsInt()
  @Min(1)
  @Max(50)
  cantidad: number;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  notas?: string;
}

export class CrearPedidoTiendaRequest {
  @IsIn(['PARA_LLEVAR', 'DELIVERY'])
  tipoPedido: 'PARA_LLEVAR' | 'DELIVERY';

  @ValidateNested()
  @Type(() => ClienteTiendaRequest)
  cliente: ClienteTiendaRequest;

  @ValidateNested()
  @IsOptional()
  @Type(() => DireccionTiendaRequest)
  direccion?: DireccionTiendaRequest;

  @IsString()
  @IsOptional()
  @MaxLength(180)
  notas?: string;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @Type(() => ItemTiendaRequest)
  items: ItemTiendaRequest[];
}
