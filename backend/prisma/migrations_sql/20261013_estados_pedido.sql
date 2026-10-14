-- =========================================================================
-- Gastrosuite: Modelado de Estados de Pedidos por Canal y Trazabilidad
-- Compatible con MariaDB / MySQL (VPS Remoto & DBeaver)
-- =========================================================================

-- 1. Tabla de Catálogo: estados_pedido
CREATE TABLE IF NOT EXISTS `estados_pedido` (
  `id` VARCHAR(191) NOT NULL,
  `ids` INT NOT NULL AUTO_INCREMENT,
  `codigo` VARCHAR(191) NOT NULL,
  `canal` VARCHAR(191) NOT NULL DEFAULT 'SALON',
  `paso` INT NOT NULL DEFAULT 1,
  `nombre` VARCHAR(191) NOT NULL,
  `descripcion` TEXT NULL,
  `colorHex` VARCHAR(191) NOT NULL DEFAULT '#D96B27',
  `esAlerta` BOOLEAN NOT NULL DEFAULT FALSE,
  `tiempoMaximoMinutos` INT NULL,
  `estado` CHAR(1) NOT NULL DEFAULT 'A',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ids` (`ids`),
  UNIQUE KEY `estados_pedido_codigo_canal_key` (`codigo`, `canal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla Intermedia / Auditoría: historial_estados_pedido
CREATE TABLE IF NOT EXISTS `historial_estados_pedido` (
  `id` VARCHAR(191) NOT NULL,
  `ids` INT NOT NULL AUTO_INCREMENT,
  `pedidoId` VARCHAR(191) NOT NULL,
  `estadoId` VARCHAR(191) NOT NULL,
  `usuarioId` VARCHAR(191) NULL,
  `cambiadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `minutosEnEstado` INT NULL,
  `notas` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ids` (`ids`),
  KEY `historial_estados_pedido_pedidoId_fkey` (`pedidoId`),
  KEY `historial_estados_pedido_estadoId_fkey` (`estadoId`),
  CONSTRAINT `historial_estados_pedido_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `historial_estados_pedido_estadoId_fkey` FOREIGN KEY (`estadoId`) REFERENCES `estados_pedido` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Población Inicial de Estados Estándar para Restaurante
INSERT IGNORE INTO `estados_pedido` (`id`, `codigo`, `canal`, `paso`, `nombre`, `descripcion`, `colorHex`, `esAlerta`, `tiempoMaximoMinutos`, `estado`) VALUES
-- Para Servir (Mesas)
(UUID(), 'INGRESADO', 'SALON', 1, 'Ingresado', 'El pedido se anotó en la caja o entró desde una app/web.', '#D96B27', FALSE, NULL, 'A'),
(UUID(), 'EN_COCINA', 'SALON', 2, 'En Cocina', 'El cocinero ya está preparando la comida o sirviendo la bebida.', '#5E8237', FALSE, 20, 'A'),
(UUID(), 'LISTO_MESA', 'SALON', 3, 'Listo para Mesa', 'La comida está terminada en el mostrador.', '#C47D2B', FALSE, NULL, 'A'),
(UUID(), 'SERVIDO', 'SALON', 4, 'Servido', 'El garzón ya dejó el plato en la mesa. El cliente está comiendo.', '#8A6E85', FALSE, NULL, 'A'),
(UUID(), 'PAGADO_CERRADO', 'SALON', 6, 'Pagado y Cerrado', 'Fin del flujo. El dinero está en caja y el cliente tiene su comida.', '#4A545C', FALSE, NULL, 'A'),

-- Para Llevar (Takeaway)
(UUID(), 'INGRESADO', 'PARA_LLEVAR', 1, 'Ingresado', 'El pedido se anotó en la caja o entró desde una app/web.', '#D96B27', FALSE, NULL, 'A'),
(UUID(), 'EN_COCINA', 'PARA_LLEVAR', 2, 'En Cocina', 'El cocinero ya está preparando la comida o sirviendo la bebida.', '#5E8237', FALSE, 20, 'A'),
(UUID(), 'LISTO_RETIRO', 'PARA_LLEVAR', 3, 'Listo para Retiro', 'La comida está empaquetada lista para retiro.', '#C47D2B', FALSE, NULL, 'A'),
(UUID(), 'ENTREGADO', 'PARA_LLEVAR', 6, 'Entregado', 'Fin del flujo. El dinero está en caja y el cliente tiene su comida.', '#4A545C', FALSE, NULL, 'A'),

-- Delivery (Reparto)
(UUID(), 'INGRESADO', 'DELIVERY', 1, 'Ingresado', 'El pedido se anotó en la caja o entró desde una app/web.', '#D96B27', FALSE, NULL, 'A'),
(UUID(), 'EN_COCINA', 'DELIVERY', 2, 'En Cocina', 'El cocinero ya está preparando la comida o sirviendo la bebida.', '#5E8237', FALSE, 20, 'A'),
(UUID(), 'LISTO_ENVIO', 'DELIVERY', 3, 'Listo para Envío', 'La comida está empaquetada lista para el repartidor.', '#C47D2B', FALSE, NULL, 'A'),
(UUID(), 'EN_CAMINO', 'DELIVERY', 5, 'En Camino', 'El repartidor lleva el pedido hacia la casa del cliente.', '#3B82F6', FALSE, NULL, 'A'),
(UUID(), 'ENTREGADO', 'DELIVERY', 6, 'Entregado', 'Fin del flujo. El dinero está en caja y el cliente tiene su comida.', '#4A545C', FALSE, NULL, 'A'),

-- Estados de Alerta Obligatorios (Para los 3 Canales)
(UUID(), 'CANCELADO', 'TODOS', 99, 'Cancelado', 'Se anula el pedido (error al anotarlo, desistimiento o falta de insumo).', '#A33129', TRUE, NULL, 'A'),
(UUID(), 'RETRASADO', 'TODOS', 98, 'Retrasado', 'Alerta visual automática si el pedido pasa más de 20 minutos en cocina.', '#D96B27', TRUE, 20, 'A');
