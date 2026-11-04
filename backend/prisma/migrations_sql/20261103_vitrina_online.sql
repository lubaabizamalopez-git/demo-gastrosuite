-- =========================================================================
-- Gastrosuite: Vitrina Online (Etapa 1) - Empresas, Clientes y Pagos Online
-- Compatible con MariaDB / MySQL (VPS Remoto & DBeaver)
-- Script idempotente y aditivo: no modifica datos existentes del POS.
-- =========================================================================

-- 1. Tabla de Empresas (restaurantes / tenants del SaaS)
CREATE TABLE IF NOT EXISTS `empresas` (
  `id` VARCHAR(191) NOT NULL COMMENT 'ID unico de la empresa',
  `ids` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(191) NOT NULL COMMENT 'Nombre comercial visible en la vitrina',
  `slug` VARCHAR(191) NOT NULL COMMENT 'Identificador en la URL de la vitrina (ej. mi-restaurant)',
  `descripcion` TEXT NULL COMMENT 'Texto de presentacion en la vitrina',
  `logoUrl` VARCHAR(500) NULL,
  `portadaUrl` VARCHAR(500) NULL COMMENT 'Imagen principal del home de la vitrina',
  `telefono` VARCHAR(191) NULL,
  `correo` VARCHAR(191) NULL,
  `direccion` VARCHAR(191) NULL,
  `horarioAtencion` VARCHAR(500) NULL COMMENT 'Texto libre de horario (ej. Lun a Dom 12:00 - 23:00)',
  `aceptaRetiro` BOOLEAN NOT NULL DEFAULT TRUE,
  `aceptaDelivery` BOOLEAN NOT NULL DEFAULT TRUE,
  `costoDelivery` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `montoMinimoDelivery` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `tiempoPreparacionMin` INT NOT NULL DEFAULT 30 COMMENT 'Minutos estimados de preparacion',
  `porcentajeImpuesto` DECIMAL(5,2) NOT NULL DEFAULT 19.00 COMMENT 'IVA incluido en los precios publicados',
  `estado` CHAR(1) NOT NULL DEFAULT 'A',
  `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ids` (`ids`),
  UNIQUE KEY `empresas_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Restaurantes que usan GastroSuite';

-- 2. Tabla de Clientes (compradores de la vitrina; claveHash NULL = invitado)
CREATE TABLE IF NOT EXISTS `clientes` (
  `id` VARCHAR(191) NOT NULL,
  `ids` INT NOT NULL AUTO_INCREMENT,
  `empresaId` VARCHAR(191) NOT NULL,
  `nombre` VARCHAR(191) NOT NULL,
  `apellido` VARCHAR(191) NULL,
  `correo` VARCHAR(191) NOT NULL,
  `telefono` VARCHAR(191) NOT NULL,
  `claveHash` VARCHAR(191) NULL COMMENT 'NULL mientras el cliente compre como invitado',
  `estado` CHAR(1) NOT NULL DEFAULT 'A',
  `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ids` (`ids`),
  UNIQUE KEY `clientes_empresaId_correo_key` (`empresaId`, `correo`),
  CONSTRAINT `clientes_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `empresas` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes finales de la vitrina online';

-- 3. Direcciones de despacho de los clientes
CREATE TABLE IF NOT EXISTS `direcciones_cliente` (
  `id` VARCHAR(191) NOT NULL,
  `ids` INT NOT NULL AUTO_INCREMENT,
  `clienteId` VARCHAR(191) NOT NULL,
  `comunaId` INT NULL,
  `calle` VARCHAR(191) NOT NULL,
  `numero` VARCHAR(50) NOT NULL,
  `depto` VARCHAR(50) NULL,
  `referencia` VARCHAR(191) NULL,
  `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ids` (`ids`),
  KEY `direcciones_cliente_clienteId_fkey` (`clienteId`),
  KEY `direcciones_cliente_comunaId_fkey` (`comunaId`),
  CONSTRAINT `direcciones_cliente_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `direcciones_cliente_comunaId_fkey` FOREIGN KEY (`comunaId`) REFERENCES `comuna` (`id_comuna`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Direcciones de despacho de clientes';

-- 4. Pedidos: datos del canal online
ALTER TABLE `pedidos`
  ADD COLUMN IF NOT EXISTS `empresaId` VARCHAR(191) NULL COMMENT 'Restaurante dueño del pedido',
  ADD COLUMN IF NOT EXISTS `clienteId` VARCHAR(191) NULL COMMENT 'Cliente de la vitrina online',
  ADD COLUMN IF NOT EXISTS `canal` VARCHAR(20) NOT NULL DEFAULT 'POS' COMMENT 'POS u ONLINE',
  ADD COLUMN IF NOT EXISTS `estadoPago` VARCHAR(20) NULL COMMENT 'PENDIENTE, PAGADO o RECHAZADO (pedidos online)',
  ADD COLUMN IF NOT EXISTS `correoCliente` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `direccionEntrega` VARCHAR(500) NULL COMMENT 'Direccion de despacho (copia al momento del pedido)',
  ADD COLUMN IF NOT EXISTS `costoDelivery` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS `codigoSeguimiento` VARCHAR(64) NULL COMMENT 'Codigo publico para seguir el pedido';

ALTER TABLE `pedidos`
  ADD UNIQUE KEY IF NOT EXISTS `pedidos_codigoSeguimiento_key` (`codigoSeguimiento`),
  ADD KEY IF NOT EXISTS `pedidos_empresaId_fkey` (`empresaId`),
  ADD KEY IF NOT EXISTS `pedidos_clienteId_fkey` (`clienteId`);

ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_empresaId_fkey` FOREIGN KEY IF NOT EXISTS (`empresaId`) REFERENCES `empresas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pedidos_clienteId_fkey` FOREIGN KEY IF NOT EXISTS (`clienteId`) REFERENCES `clientes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. Productos: visibilidad en la vitrina
ALTER TABLE `productos`
  ADD COLUMN IF NOT EXISTS `visibleOnline` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Se muestra en la vitrina online';

-- 6. Pagos: los pagos online no pertenecen a un turno de caja
ALTER TABLE `pagos` MODIFY `turnoId` VARCHAR(191) NULL;

-- 7. Transacciones con pasarelas de pago (Webpay y futuras)
CREATE TABLE IF NOT EXISTS `transacciones_pago` (
  `id` VARCHAR(191) NOT NULL,
  `ids` INT NOT NULL AUTO_INCREMENT,
  `empresaId` VARCHAR(191) NOT NULL,
  `pedidoId` VARCHAR(191) NOT NULL,
  `pasarela` VARCHAR(30) NOT NULL DEFAULT 'WEBPAY',
  `ordenCompra` VARCHAR(26) NOT NULL COMMENT 'buy_order enviado a la pasarela',
  `token` VARCHAR(191) NULL,
  `monto` DECIMAL(10,2) NOT NULL,
  `estado` VARCHAR(20) NOT NULL DEFAULT 'INICIADA' COMMENT 'INICIADA, AUTORIZADA, RECHAZADA o ANULADA',
  `codigoAutorizacion` VARCHAR(50) NULL,
  `tipoPago` VARCHAR(10) NULL COMMENT 'VD debito, VN credito, VP prepago, etc.',
  `cuotas` INT NULL,
  `ultimosDigitos` VARCHAR(4) NULL,
  `respuesta` LONGTEXT NULL COMMENT 'Respuesta completa de la pasarela',
  `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ids` (`ids`),
  UNIQUE KEY `transacciones_pago_ordenCompra_key` (`ordenCompra`),
  UNIQUE KEY `transacciones_pago_token_key` (`token`),
  KEY `transacciones_pago_pedidoId_fkey` (`pedidoId`),
  CONSTRAINT `transacciones_pago_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Transacciones con pasarelas de pago online';

-- 8. Datos iniciales
INSERT INTO `metodos_pago` (`id`, `nombre`, `codigo`, `estado`)
SELECT UUID(), 'Webpay', 'WEBPAY', 'A'
WHERE NOT EXISTS (SELECT 1 FROM `metodos_pago` WHERE `codigo` = 'WEBPAY');

INSERT INTO `empresas` (`id`, `nombre`, `slug`, `descripcion`, `telefono`, `direccion`, `horarioAtencion`, `costoDelivery`, `portadaUrl`)
SELECT UUID(), 'Vitrina Demo', 'vitrina-demo',
  'Cocina de autor, hamburguesas premium y pizzas artesanales. Pide online y retira en el local o recibe en tu casa.',
  '+56912345678', 'Av. Principal 123', 'Lunes a Domingo · 12:00 a 23:00', 2500.00,
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM `empresas` WHERE `slug` = 'vitrina-demo');
