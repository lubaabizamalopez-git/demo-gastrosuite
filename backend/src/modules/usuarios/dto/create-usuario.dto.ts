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
}
