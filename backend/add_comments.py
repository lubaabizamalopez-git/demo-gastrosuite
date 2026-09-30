# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "pymysql",
# ]
# ///
import pymysql

comments = {
  "usuarios": {
    "id": "Identificador unico del usuario",
    "rut": "Numero de documento RUT o pasaporte",
    "dv": "Digito verificador del RUT",
    "correo": "Correo electronico para iniciar sesion",
    "claveHash": "Contrasena encriptada",
    "nombre": "Primer o segundo nombre",
    "apellidoPaterno": "Apellido paterno",
    "apellidoMaterno": "Apellido materno",
    "codigoPin": "PIN de 4 digitos para acceso rapido en caja",
    "creadoEn": "Fecha de creacion del registro",
    "actualizadoEn": "Fecha de ultima modificacion",
    "ids": "Identificador secundario legible para humanos",
    "tipoDocumento": "Tipo de documento RUT PASAPORTE DNI",
    "estado": "Indica si el usuario puede acceder al sistema. A: Activo, I: Inactivo"
  },
  "roles": {
    "id": "Identificador unico del rol",
    "nombre": "Nombre del rol",
    "descripcion": "Breve descripcion de los permisos del rol",
    "ids": "Identificador secundario legible para humanos"
  },
  "usuarios_roles": {
    "usuarioId": "ID del usuario",
    "rolId": "ID del rol asignado"
  },
  "categorias": {
    "id": "Identificador unico de la categoria",
    "nombre": "Nombre visible de la categoria",
    "icono": "Nombre del icono para mostrar en el frontend",
    "orden": "Numero para ordenar la categoria en el menu",
    "ids": "Identificador secundario legible para humanos",
    "estado": "Estado. A: Activo, I: Inactivo"
  },
  "productos": {
    "id": "Identificador unico del producto",
    "categoriaId": "ID de la categoria a la que pertenece",
    "nombre": "Nombre del producto",
    "descripcion": "Descripcion o ingredientes visibles para el cliente",
    "precio": "Precio base de venta",
    "sku": "Codigo de barra o identificador unico de inventario",
    "imagen": "URL de la foto del producto",
    "areaPreparacion": "Area de preparacion. COCINA, BAR, POSTRES, PARRILLA",
    "ids": "Identificador secundario legible para humanos",
    "orden": "Orden del producto para mostrarse",
    "estado": "Estado. A: Activo, I: Inactivo"
  },
  "variantes_producto": {
    "id": "Identificador unico de la variante",
    "productoId": "Producto padre",
    "nombre": "Nombre de la variante",
    "precio": "Precio de esta variante especifica",
    "sku": "Codigo SKU especifico",
    "ids": "Identificador secundario legible para humanos"
  },
  "grupos_modificadores": {
    "id": "ID unico del grupo",
    "productoId": "Producto al que pertenece este grupo",
    "nombre": "Nombre de la instruccion",
    "minSeleccion": "Cantidad minima que el cliente debe elegir",
    "maxSeleccion": "Cantidad maxima que el cliente puede elegir",
    "esRequerido": "Atajo para saber si debe seleccionarse obligatoriamente",
    "ids": "Identificador secundario legible para humanos"
  },
  "modificadores": {
    "id": "ID unico",
    "grupoModificadorId": "Grupo al que pertenece",
    "nombre": "Nombre de la opcion",
    "precioAdicional": "Costo extra si el cliente elige esta opcion",
    "ids": "Identificador secundario legible para humanos"
  },
  "insumos": {
    "id": "ID del insumo",
    "nombre": "Nombre del insumo",
    "unidad": "Unidad en la que se mide su stock. KG, GRAMOS, LITROS, MILILITROS, CC, CM, METROS, UNIDADES, CANTIDAD, PORCION",
    "stockActual": "Stock disponible actualmente",
    "stockMinimo": "Alerta de stock bajo",
    "costoPorUnidad": "Costo promedio por unidad",
    "ids": "Identificador secundario legible para humanos"
  },
  "recetas_producto": {
    "id": "ID unico",
    "productoId": "Producto final",
    "insumoId": "Insumo requerido",
    "cantidad": "Cuanto insumo se descuenta por cada producto vendido",
    "ids": "Identificador secundario legible para humanos"
  },
  "movimientos_inventario": {
    "id": "ID unico del movimiento",
    "insumoId": "Insumo modificado",
    "usuarioId": "Empleado que registro o provoco el movimiento",
    "tipo": "Clasificacion del movimiento. ENTRADA, SALIDA, VENTA, MERMA, AJUSTE",
    "cantidad": "Cantidad sumada o restada",
    "costo": "Costo total de este movimiento",
    "notas": "Motivo o razon",
    "creadoEn": "Fecha y hora exacta",
    "ids": "Identificador secundario legible para humanos"
  },
  "areas_salon": {
    "id": "ID del area",
    "nombre": "Nombre del area",
    "orden": "Orden para mostrar en pestanas",
    "ids": "Identificador secundario legible para humanos"
  },
  "mesas": {
    "id": "ID unico de la mesa",
    "areaSalonId": "ID del area a la que pertenece",
    "numeroMesa": "Identificador visible",
    "capacidad": "Cuantas personas caben",
    "estado": "D: Disponible, CS: Cuenta Solicitada, R: Reservada, O: Ocupada, L: Limpiando, EM: En Mantencion",
    "posX": "Eje X en el mapa visual",
    "posY": "Eje Y en el mapa visual",
    "ids": "Identificador secundario legible para humanos"
  },
  "pedidos": {
    "id": "ID unico del pedido",
    "numeroPedido": "Numero autoincremental facil de leer para el cliente",
    "tipoPedido": "Modalidad de venta. SALON, PARA_LLEVAR, DELIVERY",
    "estado": "Estado general del ticket. PENDIENTE, EN_COCINA, LISTO, ENTREGADO, PAGADO, CANCELADO",
    "mesaId": "Si es SALON que mesa es",
    "meseroId": "Quien atendio la mesa",
    "nombreCliente": "Para delivery o para llevar",
    "telefonoCliente": "Telefono para delivery",
    "notas": "Notas adicionales",
    "subtotal": "Suma de precios sin impuesto",
    "impuestos": "Monto de impuestos calculados",
    "descuento": "Descuentos aplicados",
    "propina": "Propina voluntaria dejada",
    "total": "Gran total a pagar",
    "creadoEn": "Fecha de creacion",
    "actualizadoEn": "Fecha de actualizacion"
  },
  "items_pedido": {
    "id": "ID del item",
    "pedidoId": "Pedido al que pertenece",
    "productoId": "Que producto es",
    "varianteId": "Si eligio tamano familiar etc",
    "cantidad": "Cantidad pedida",
    "precioUnitario": "Precio de 1 unidad",
    "precioTotal": "Precio final",
    "estado": "Estado en la estacion de preparacion. PENDIENTE, PREPARANDO, LISTO, SERVIDO, CANCELADO",
    "notas": "Indicaciones adicionales",
    "areaPreparacion": "A que impresora KDS se envio. COCINA, BAR, POSTRES, PARRILLA",
    "enviadoACocinaEn": "Hora exacta en la que se comando",
    "ids": "Identificador secundario legible para humanos"
  },
  "modificadores_item_pedido": {
    "id": "ID unico",
    "itemPedidoId": "Item al que pertenece",
    "modificadorId": "Modificador elegido",
    "precio": "Precio cobrado por este extra",
    "ids": "Identificador secundario legible para humanos"
  },
  "metodos_pago": {
    "id": "ID unico del metodo",
    "nombre": "Nombre visible",
    "codigo": "Codigo interno",
    "ids": "Identificador secundario legible para humanos",
    "estado": "Estado. A: Activo, I: Inactivo"
  },
  "pagos": {
    "id": "ID del registro de pago",
    "pedidoId": "A que pedido pertenece",
    "turnoId": "En que turno de caja se recibio",
    "monto": "Cuanto se pago",
    "metodoPagoId": "ID del Metodo de pago usado",
    "numeroReferencia": "Nro de voucher o transferencia",
    "creadoEn": "Hora del pago",
    "ids": "Identificador secundario legible para humanos"
  },
  "turnos_caja": {
    "id": "ID del turno",
    "usuarioId": "Cajero responsable",
    "abiertoEn": "Hora en que abrio",
    "cerradoEn": "Hora del cierre",
    "efectivoInicial": "Con cuanto sencillo empezo",
    "efectivoEsperado": "Cuanto deberia haber segun el sistema",
    "efectivoReal": "Cuanto conto el cajero fisicamente",
    "diferencia": "Sobrante o Faltante",
    "estado": "Estado actual de este turno",
    "notas": "Justificaciones de descuadres",
    "ids": "Identificador secundario legible para humanos"
  },
  "configuraciones_impresora": {
    "id": "ID de impresora",
    "nombre": "Nombre de la impresora",
    "areaDestino": "Que platos manda a imprimir aca. COCINA, BAR, POSTRES, PARRILLA",
    "tipoConexion": "Tipo de conexion. RED_IP, USB_AGENTE_LOCAL",
    "direccionIp": "IP si es de red",
    "puerto": "Puerto",
    "anchoPapelMm": "80mm o 58mm",
    "esPosPrincipal": "Si es la que emite boletas principales",
    "ids": "Identificador secundario legible para humanos",
    "estado": "Estado. A: Activo, I: Inactivo"
  },
  "configuracion_empresa": {
    "id": "ID unico",
    "nombreEmpresa": "Nombre o Razon Social",
    "ruc": "RUT NIT o RUC",
    "direccion": "Direccion matriz",
    "telefono": "Numero de contacto",
    "simboloMoneda": "Simbolo de peso o dolar",
    "porcentajeImpuesto": "IVA o IGV",
    "cabeceraImpresion": "Mensaje superior del ticket",
    "pieImpresion": "Mensaje de agradecimiento",
    "ids": "Identificador secundario legible para humanos"
  }
}

conn = pymysql.connect(
    host='129.121.36.186',
    user='gastro_admin',
    password='lucas06122012',
    database='gastrosuite_db',
    port=3306,
    cursorclass=pymysql.cursors.DictCursor
)

with conn.cursor() as cur:
    for table, cols in comments.items():
        for col, comment in cols.items():
            cur.execute("""
                SELECT COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA, CHARACTER_SET_NAME, COLLATION_NAME
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = %s AND COLUMN_NAME = %s AND TABLE_SCHEMA = 'gastrosuite_db'
            """, (table, col))
            row = cur.fetchone()
            if row:
                col_type = row['COLUMN_TYPE']
                if row['CHARACTER_SET_NAME']:
                    col_type += f" CHARACTER SET {row['CHARACTER_SET_NAME']} COLLATE {row['COLLATION_NAME']}"
                
                nullability = "NULL" if row['IS_NULLABLE'] == 'YES' else "NOT NULL"
                
                default_str = ""
                if row['COLUMN_DEFAULT'] is not None:
                    # In pymysql it comes as string. E.g. 'CURRENT_TIMESTAMP'
                    d = row['COLUMN_DEFAULT']
                    if 'CURRENT_TIMESTAMP' in d.upper():
                        default_str = f"DEFAULT {d}"
                    elif d.startswith("'") or d.startswith("`"):
                        default_str = f"DEFAULT {d}"
                    elif d.isdigit() or d.replace('.','',1).isdigit():
                        default_str = f"DEFAULT {d}"
                    else:
                        default_str = f"DEFAULT '{d}'"
                        
                extra = row['EXTRA']
                if 'DEFAULT_GENERATED' in extra:
                    extra = extra.replace('DEFAULT_GENERATED', '')
                    
                alter_sql = f"ALTER TABLE {table} MODIFY COLUMN {col} {col_type} {nullability} {default_str} {extra} COMMENT '{comment}'"
                
                try:
                    cur.execute(alter_sql)
                    print(f"✅ {table}.{col} updated.")
                except Exception as e:
                    print(f"❌ Error in {table}.{col}: {e}")
                    
conn.commit()
conn.close()
