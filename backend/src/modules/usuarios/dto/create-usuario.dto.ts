export class CreateUsuarioDto {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  tipoDocumento: string;
  rut?: string;
  dv?: string;
  correo: string;
  codigoPin?: string;
  roles?: string[];
  telefono?: string;
  direccion?: string;
  regionId?: number;
  comunaId?: number;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
  imagenUrl?: string;
}
