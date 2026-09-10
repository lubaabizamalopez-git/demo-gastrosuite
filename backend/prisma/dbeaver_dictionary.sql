-- DICCIONARIO DE DATOS PARA MARIA DB (Ejecutar en DBeaver)

-- TABLA: usuarios
ALTER TABLE `usuarios` COMMENT = 'Representa a un empleado o persona con acceso al sistema';
ALTER TABLE `usuarios` MODIFY COLUMN `id` VARCHAR(191) COMMENT 'Identificador único del usuario (UUID)';
ALTER TABLE `usuarios` MODIFY COLUMN `rut` VARCHAR(191) COMMENT 'RUT sin dígito verificador';
ALTER TABLE `usuarios` MODIFY COLUMN `dv` VARCHAR(191) COMMENT 'Dígito verificador del RUT';
ALTER TABLE `usuarios` MODIFY COLUMN `correo` VARCHAR(191) COMMENT 'Correo electrónico (usado para iniciar sesión)';
ALTER TABLE `usuarios` MODIFY COLUMN `claveHash` VARCHAR(191) COMMENT 'Contraseña encriptada';
ALTER TABLE `usuarios` MODIFY COLUMN `nombre` VARCHAR(191) COMMENT 'Primer y/o segundo nombre';
ALTER TABLE `usuarios` MODIFY COLUMN `apellidoPaterno` VARCHAR(191) COMMENT 'Apellido Paterno';
ALTER TABLE `usuarios` MODIFY COLUMN `apellidoMaterno` VARCHAR(191) COMMENT 'Apellido Materno';
ALTER TABLE `usuarios` MODIFY COLUMN `codigoPin` VARCHAR(191) COMMENT 'PIN de 4 dígitos para acceso rápido en la caja (POS)';
ALTER TABLE `usuarios` MODIFY COLUMN `activo` TINYINT(1) COMMENT 'Indica si el usuario puede acceder al sistema';
ALTER TABLE `usuarios` MODIFY COLUMN `creadoEn` DATETIME(3) COMMENT 'Fecha de creación del registro';
ALTER TABLE `usuarios` MODIFY COLUMN `actualizadoEn` DATETIME(3) COMMENT 'Fecha de última modificación';

-- TABLA: roles
ALTER TABLE `roles` COMMENT = 'Representa un rol o cargo dentro del sistema';
ALTER TABLE `roles` MODIFY COLUMN `id` VARCHAR(191) COMMENT 'Identificador único del rol';
ALTER TABLE `roles` MODIFY COLUMN `nombre` VARCHAR(191) COMMENT 'Nombre del rol (ej. ADMINISTRADOR)';
ALTER TABLE `roles` MODIFY COLUMN `descripcion` VARCHAR(191) COMMENT 'Breve descripción de los permisos del rol';

-- TABLA: usuarios_roles
ALTER TABLE `usuarios_roles` COMMENT = 'Tabla intermedia para asignar múltiples roles a un usuario';
ALTER TABLE `usuarios_roles` MODIFY COLUMN `usuarioId` VARCHAR(191) COMMENT 'ID del usuario';
ALTER TABLE `usuarios_roles` MODIFY COLUMN `rolId` VARCHAR(191) COMMENT 'ID del rol asignado';

-- TABLA: categorias
ALTER TABLE `categorias` COMMENT = 'Categoría principal para organizar los productos (ej. Bebidas, Platos de Fondo)';
ALTER TABLE `categorias` MODIFY COLUMN `id` VARCHAR(191) COMMENT 'Identificador único de la categoría';
ALTER TABLE `categorias` MODIFY COLUMN `nombre` VARCHAR(191) COMMENT 'Nombre visible de la categoría';
ALTER TABLE `categorias` MODIFY COLUMN `icono` VARCHAR(191) COMMENT 'Nombre del ícono para mostrar en el frontend';
ALTER TABLE `categorias` MODIFY COLUMN `orden` INT COMMENT 'Número para ordenar la categoría en el menú';
ALTER TABLE `categorias` MODIFY COLUMN `activo` TINYINT(1) COMMENT 'Si es falso, la categoría y sus productos no se muestran';

-- TABLA: productos
ALTER TABLE `productos` COMMENT = 'Producto vendible en el restaurante';
ALTER TABLE `productos` MODIFY COLUMN `id` VARCHAR(191) COMMENT 'Identificador único del producto';
ALTER TABLE `productos` MODIFY COLUMN `categoriaId` VARCHAR(191) COMMENT 'ID de la categoría a la que pertenece';
ALTER TABLE `productos` MODIFY COLUMN `nombre` VARCHAR(191) COMMENT 'Nombre del producto';
ALTER TABLE `productos` MODIFY COLUMN `descripcion` TEXT COMMENT 'Descripción o ingredientes visibles para el cliente';
ALTER TABLE `productos` MODIFY COLUMN `precio` DECIMAL(10,2) COMMENT 'Precio base de venta';
ALTER TABLE `productos` MODIFY COLUMN `sku` VARCHAR(191) COMMENT 'Código de barra o identificador único de inventario';
ALTER TABLE `productos` MODIFY COLUMN `imagen` VARCHAR(191) COMMENT 'URL de la foto del producto';
ALTER TABLE `productos` MODIFY COLUMN `activo` TINYINT(1) COMMENT 'Indica si el producto está disponible para la venta';
ALTER TABLE `productos` MODIFY COLUMN `areaPreparacion` VARCHAR(191) COMMENT 'Área donde se prepara este producto (ej. COCINA, BAR)';

-- TABLA: variantes_producto
ALTER TABLE `variantes_producto` COMMENT = 'Tamaños o variaciones de un producto base (ej. Pizza Familiar vs Personal)';
ALTER TABLE `variantes_producto` MODIFY COLUMN `id` VARCHAR(191) COMMENT 'Identificador único de la variante';
ALTER TABLE `variantes_producto` MODIFY COLUMN `productoId` VARCHAR(191) COMMENT 'Producto padre';
ALTER TABLE `variantes_producto` MODIFY COLUMN `nombre` VARCHAR(191) COMMENT 'Nombre de la variante (ej. "Familiar")';
ALTER TABLE `variantes_producto` MODIFY COLUMN `precio` DECIMAL(10,2) COMMENT 'Precio de esta variante específica';
ALTER TABLE `variantes_producto` MODIFY COLUMN `sku` VARCHAR(191) COMMENT 'Código SKU específico';

-- TABLA: grupos_modificadores
ALTER TABLE `grupos_modificadores` COMMENT = 'Grupo de modificadores u opciones (ej. "Elige tu salsa", "Término de la carne")';
ALTER TABLE `grupos_modificadores` MODIFY COLUMN `id` VARCHAR(191) COMMENT 'ID único del grupo';
ALTER TABLE `grupos_modificadores` MODIFY COLUMN `productoId` VARCHAR(191) COMMENT 'Producto al que pertenece este grupo';
ALTER TABLE `grupos_modificadores` MODIFY COLUMN `nombre` VARCHAR(191) COMMENT 'Nombre de la instrucción (ej. "Elige 2 salsas")';
ALTER TABLE `grupos_modificadores` MODIFY COLUMN `minSeleccion` INT COMMENT 'Cantidad mínima que el cliente debe elegir (0 = opcional)';
ALTER TABLE `grupos_modificadores` MODIFY COLUMN `maxSeleccion` INT COMMENT 'Cantidad máxima que el cliente puede elegir';
ALTER TABLE `grupos_modificadores` MODIFY COLUMN `esRequerido` TINYINT(1) COMMENT 'Atajo para saber si debe seleccionarse obligatoriamente';

-- TABLA: modificadores
ALTER TABLE `modificadores` COMMENT = 'Modificador individual (ej. "Ketchup", "Bien cocido", "Sin cebolla")';
ALTER TABLE `modificadores` MODIFY COLUMN `id` VARCHAR(191) COMMENT 'ID único';
ALTER TABLE `modificadores` MODIFY COLUMN `grupoModificadorId` VARCHAR(191) COMMENT 'Grupo al que pertenece';
ALTER TABLE `modificadores` MODIFY COLUMN `nombre` VARCHAR(191) COMMENT 'Nombre de la opción';
ALTER TABLE `modificadores` MODIFY COLUMN `precioAdicional` DECIMAL(10,2) COMMENT 'Costo extra si el cliente elige esta opción';

-- TABLA: insumos
ALTER TABLE `insumos` COMMENT = 'Ingredientes o insumos base que no se venden directamente pero componen las recetas';
ALTER TABLE `insumos` MODIFY COLUMN `id` VARCHAR(191) COMMENT 'ID del insumo';
ALTER TABLE `insumos` MODIFY COLUMN `nombre` VARCHAR(191) COMMENT 'Nombre del insumo (ej. "Tomate", "Carne Molida")';
ALTER TABLE `insumos` MODIFY COLUMN `unidad` VARCHAR(191) COMMENT 'Unidad en la que se mide su stock';
ALTER TABLE `insumos` MODIFY COLUMN `stockActual` DECIMAL(10,3) COMMENT 'Stock disponible actualmente';
ALTER TABLE `insumos` MODIFY COLUMN `stockMinimo` DECIMAL(10,3) COMMENT 'Alerta de stock bajo';
ALTER TABLE `insumos` MODIFY COLUMN `costoPorUnidad` DECIMAL(10,2) COMMENT 'Costo promedio por unidad';

-- TABLA: recetas_producto
ALTER TABLE `recetas_producto` COMMENT = 'Relación de ingredientes que componen un Producto';
ALTER TABLE `recetas_producto` MODIFY COLUMN `id` VARCHAR(191) COMMENT 'ID único';
ALTER TABLE `recetas_producto` MODIFY COLUMN `productoId` VARCHAR(191) COMMENT 'Producto final';
ALTER TABLE `recetas_producto` MODIFY COLUMN `insumoId` VARCHAR(191) COMMENT 'Insumo requerido';
ALTER TABLE `recetas_producto` MODIFY COLUMN `cantidad` DECIMAL(10,3) COMMENT 'Cuánto insumo se descuenta por cada producto vendido';

-- TABLA: movimientos_inventario
ALTER TABLE `movimientos_inventario` COMMENT = 'Historial de movimientos (Kardex) de cada insumo';
ALTER TABLE `movimientos_inventario` MODIFY COLUMN `id` VARCHAR(191) COMMENT 'ID único del movimiento';
ALTER TABLE `movimientos_inventario` MODIFY COLUMN `insumoId` VARCHAR(191) COMMENT 'Insumo modificado';
ALTER TABLE `movimientos_inventario` MODIFY COLUMN `usuarioId` VARCHAR(191) COMMENT 'Empleado que registró o provocó el movimiento';
ALTER TABLE `movimientos_inventario` MODIFY COLUMN `tipo` VARCHAR(191) COMMENT 'Clasificación del movimiento';
ALTER TABLE `movimientos_inventario` MODIFY COLUMN `cantidad` DECIMAL(10,3) COMMENT 'Cantidad sumada o restada';
ALTER TABLE `movimientos_inventario` MODIFY COLUMN `costo` DECIMAL(10,2) COMMENT 'Costo total de este movimiento (si aplica)';
ALTER TABLE `movimientos_inventario` MODIFY COLUMN `notas` VARCHAR(191) COMMENT 'Motivo o razón (ej. "Tomates en mal estado")';
ALTER TABLE `movimientos_inventario` MODIFY COLUMN `creadoEn` DATETIME(3) COMMENT 'Fecha y hora exacta';

-- TABLA: areas_salon
ALTER TABLE `areas_salon` COMMENT = 'Zonas del local (ej. Terraza, Primer Piso)';
ALTER TABLE `areas_salon` MODIFY COLUMN `id` VARCHAR(191) COMMENT 'ID del área';
ALTER TABLE `areas_salon` MODIFY COLUMN `nombre` VARCHAR(191) COMMENT 'Nombre del área';
ALTER TABLE `areas_salon` MODIFY COLUMN `orden` INT COMMENT 'Orden para mostrar en pestañas';

-- TABLA: mesas
ALTER TABLE `mesas` COMMENT = 'Mesa individual dentro de un área';
ALTER TABLE `mesas` MODIFY COLUMN `id` VARCHAR(191) COMMENT 'ID único de la mesa';
ALTER TABLE `mesas` MODIFY COLUMN `areaSalonId` VARCHAR(191) COMMENT 'ID del área a la que pertenece';
ALTER TABLE `mesas` MODIFY COLUMN `numeroMesa` VARCHAR(191) COMMENT 'Identificador visible (ej. "Mesa 5", "T-12")';
ALTER TABLE `mesas` MODIFY COLUMN `capacidad` INT COMMENT 'Cuántas personas caben';
ALTER TABLE `mesas` MODIFY COLUMN `estado` VARCHAR(191) COMMENT 'Si está libre, ocupada, etc.';
ALTER TABLE `mesas` MODIFY COLUMN `posX` INT COMMENT 'Eje X en el mapa visual';
ALTER TABLE `mesas` MODIFY COLUMN `posY` INT COMMENT 'Eje Y en el mapa visual';

-- TABLA: pedidos
ALTER TABLE `pedidos` COMMENT = 'Cabecera de la cuenta o comanda';
ALTER TABLE `pedidos` MODIFY COLUMN `id` VARCHAR(191) COMMENT 'ID único del pedido (UUID)';
ALTER TABLE `pedidos` MODIFY COLUMN `numeroPedido` INT COMMENT 'Número autoincremental fácil de leer para el cliente';
ALTER TABLE `pedidos` MODIFY COLUMN `tipoPedido` VARCHAR(191) COMMENT 'Modalidad de venta';
ALTER TABLE `pedidos` MODIFY COLUMN `estado` VARCHAR(191) COMMENT 'Estado general del ticket';
ALTER TABLE `pedidos` MODIFY COLUMN `mesaId` VARCHAR(191) COMMENT 'Si es SALON, qué mesa es';
ALTER TABLE `pedidos` MODIFY COLUMN `meseroId` VARCHAR(191) COMMENT 'Quién atendió la mesa';
ALTER TABLE `pedidos` MODIFY COLUMN `nombreCliente` VARCHAR(191) COMMENT 'Para delivery o para llevar';
ALTER TABLE `pedidos` MODIFY COLUMN `subtotal` DECIMAL(10,2) COMMENT 'Suma de precios sin impuesto';
ALTER TABLE `pedidos` MODIFY COLUMN `impuestos` DECIMAL(10,2) COMMENT 'Monto de impuestos calculados';
ALTER TABLE `pedidos` MODIFY COLUMN `descuento` DECIMAL(10,2) COMMENT 'Descuentos aplicados';
ALTER TABLE `pedidos` MODIFY COLUMN `propina` DECIMAL(10,2) COMMENT 'Propina voluntaria dejada';
ALTER TABLE `pedidos` MODIFY COLUMN `total` DECIMAL(10,2) COMMENT 'Gran total a pagar';

-- TABLA: items_pedido
ALTER TABLE `items_pedido` COMMENT = 'Plato o bebida específica dentro de un Pedido';
ALTER TABLE `items_pedido` MODIFY COLUMN `id` VARCHAR(191) COMMENT 'ID del ítem';
ALTER TABLE `items_pedido` MODIFY COLUMN `pedidoId` VARCHAR(191) COMMENT 'Pedido al que pertenece';
ALTER TABLE `items_pedido` MODIFY COLUMN `productoId` VARCHAR(191) COMMENT 'Qué producto es';
ALTER TABLE `items_pedido` MODIFY COLUMN `varianteId` VARCHAR(191) COMMENT 'Si eligió tamaño familiar, etc.';
ALTER TABLE `items_pedido` MODIFY COLUMN `cantidad` INT COMMENT 'Cantidad pedida';
ALTER TABLE `items_pedido` MODIFY COLUMN `precioUnitario` DECIMAL(10,2) COMMENT 'Precio de 1 unidad';
ALTER TABLE `items_pedido` MODIFY COLUMN `precioTotal` DECIMAL(10,2) COMMENT 'Precio final (cantidad * precioUnitario + extras)';
ALTER TABLE `items_pedido` MODIFY COLUMN `estado` VARCHAR(191) COMMENT 'Estado en la estación de preparación';
ALTER TABLE `items_pedido` MODIFY COLUMN `notas` VARCHAR(191) COMMENT 'Indicaciones (ej. "Poco ají")';
ALTER TABLE `items_pedido` MODIFY COLUMN `areaPreparacion` VARCHAR(191) COMMENT 'A qué impresora/pantalla KDS se envió';
ALTER TABLE `items_pedido` MODIFY COLUMN `enviadoACocinaEn` DATETIME(3) COMMENT 'Hora exacta en la que se comandó';

-- TABLA: modificadores_item_pedido
ALTER TABLE `modificadores_item_pedido` COMMENT = 'Modificador específico elegido para un ItemPedido';
ALTER TABLE `modificadores_item_pedido` MODIFY COLUMN `precio` DECIMAL(10,2) COMMENT 'Precio cobrado por este extra';

-- TABLA: metodos_pago
ALTER TABLE `metodos_pago` COMMENT = 'Formas de pago aceptadas (Dinámico para poder activar/desactivar)';
ALTER TABLE `metodos_pago` MODIFY COLUMN `id` VARCHAR(191) COMMENT 'ID único del método';
ALTER TABLE `metodos_pago` MODIFY COLUMN `nombre` VARCHAR(191) COMMENT 'Nombre visible (ej. "Efectivo", "Transbank", "MercadoPago")';
ALTER TABLE `metodos_pago` MODIFY COLUMN `codigo` VARCHAR(191) COMMENT 'Código interno';
ALTER TABLE `metodos_pago` MODIFY COLUMN `activo` TINYINT(1) COMMENT 'Indica si el cajero puede ver esta opción';

-- TABLA: pagos
ALTER TABLE `pagos` COMMENT = 'Abono o pago realizado a un pedido';
ALTER TABLE `pagos` MODIFY COLUMN `id` VARCHAR(191) COMMENT 'ID del registro de pago';
ALTER TABLE `pagos` MODIFY COLUMN `pedidoId` VARCHAR(191) COMMENT 'A qué pedido pertenece';
ALTER TABLE `pagos` MODIFY COLUMN `turnoId` VARCHAR(191) COMMENT 'En qué turno de caja se recibió';
ALTER TABLE `pagos` MODIFY COLUMN `monto` DECIMAL(10,2) COMMENT 'Cuánto se pagó';
ALTER TABLE `pagos` MODIFY COLUMN `metodoPagoId` VARCHAR(191) COMMENT 'ID del Método de pago usado';
ALTER TABLE `pagos` MODIFY COLUMN `numeroReferencia` VARCHAR(191) COMMENT 'Nro de voucher o transferencia';
ALTER TABLE `pagos` MODIFY COLUMN `creadoEn` DATETIME(3) COMMENT 'Hora del pago';

-- TABLA: turnos_caja
ALTER TABLE `turnos_caja` COMMENT = 'Control de apertura y cierre de caja';
ALTER TABLE `turnos_caja` MODIFY COLUMN `id` VARCHAR(191) COMMENT 'ID del turno';
ALTER TABLE `turnos_caja` MODIFY COLUMN `usuarioId` VARCHAR(191) COMMENT 'Cajero responsable';
ALTER TABLE `turnos_caja` MODIFY COLUMN `abiertoEn` DATETIME(3) COMMENT 'Hora en que abrió';
ALTER TABLE `turnos_caja` MODIFY COLUMN `cerradoEn` DATETIME(3) COMMENT 'Hora del cierre';
ALTER TABLE `turnos_caja` MODIFY COLUMN `efectivoInicial` DECIMAL(10,2) COMMENT 'Con cuánto sencillo empezó';
ALTER TABLE `turnos_caja` MODIFY COLUMN `efectivoEsperado` DECIMAL(10,2) COMMENT 'Cuánto debería haber según el sistema';
ALTER TABLE `turnos_caja` MODIFY COLUMN `efectivoReal` DECIMAL(10,2) COMMENT 'Cuánto contó el cajero físicamente';
ALTER TABLE `turnos_caja` MODIFY COLUMN `diferencia` DECIMAL(10,2) COMMENT 'Sobrante o Faltante';
ALTER TABLE `turnos_caja` MODIFY COLUMN `estado` VARCHAR(191) COMMENT 'Estado actual de este turno';
ALTER TABLE `turnos_caja` MODIFY COLUMN `notas` VARCHAR(191) COMMENT 'Justificaciones de descuadres';

-- TABLA: configuraciones_impresora
ALTER TABLE `configuraciones_impresora` COMMENT = 'Configuración de puntos de impresión';
ALTER TABLE `configuraciones_impresora` MODIFY COLUMN `id` VARCHAR(191) COMMENT 'ID de impresora';
ALTER TABLE `configuraciones_impresora` MODIFY COLUMN `nombre` VARCHAR(191) COMMENT 'Ej: "Impresora Barra", "Impresora Cocina"';
ALTER TABLE `configuraciones_impresora` MODIFY COLUMN `areaDestino` VARCHAR(191) COMMENT 'Qué platos manda a imprimir acá';
ALTER TABLE `configuraciones_impresora` MODIFY COLUMN `tipoConexion` VARCHAR(191) COMMENT 'RED_IP o USB';
ALTER TABLE `configuraciones_impresora` MODIFY COLUMN `direccionIp` VARCHAR(191) COMMENT 'IP (si es de red)';
ALTER TABLE `configuraciones_impresora` MODIFY COLUMN `puerto` INT COMMENT 'Puerto';
ALTER TABLE `configuraciones_impresora` MODIFY COLUMN `anchoPapelMm` INT COMMENT '80mm o 58mm';
ALTER TABLE `configuraciones_impresora` MODIFY COLUMN `esPosPrincipal` TINYINT(1) COMMENT 'Si es la que emite boletas principales';
ALTER TABLE `configuraciones_impresora` MODIFY COLUMN `activa` TINYINT(1) COMMENT 'Si está encendida/operativa';

-- TABLA: configuracion_empresa
ALTER TABLE `configuracion_empresa` COMMENT = 'Datos principales de la empresa (aparecen en ticket)';
ALTER TABLE `configuracion_empresa` MODIFY COLUMN `nombreEmpresa` VARCHAR(191) COMMENT 'Nombre o Razón Social';
ALTER TABLE `configuracion_empresa` MODIFY COLUMN `ruc` VARCHAR(191) COMMENT 'RUT / NIT / RUC';
ALTER TABLE `configuracion_empresa` MODIFY COLUMN `direccion` VARCHAR(191) COMMENT 'Dirección matriz';
ALTER TABLE `configuracion_empresa` MODIFY COLUMN `telefono` VARCHAR(191) COMMENT 'Número de contacto';
ALTER TABLE `configuracion_empresa` MODIFY COLUMN `simboloMoneda` VARCHAR(191) COMMENT 'Símbolo de peso/dólar';
ALTER TABLE `configuracion_empresa` MODIFY COLUMN `porcentajeImpuesto` DECIMAL(5,2) COMMENT 'IVA / IGV';
ALTER TABLE `configuracion_empresa` MODIFY COLUMN `cabeceraImpresion` TEXT COMMENT 'Mensaje superior del ticket';
ALTER TABLE `configuracion_empresa` MODIFY COLUMN `pieImpresion` TEXT COMMENT 'Mensaje de agradecimiento';
