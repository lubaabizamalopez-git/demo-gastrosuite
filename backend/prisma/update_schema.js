const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const modelsToAddIds = [
  'Usuario', 'Rol', 'Categoria', 'VarianteProducto', 'GrupoModificador',
  'Modificador', 'Insumo', 'RecetaProducto', 'MovimientoInventario',
  'AreaSalon', 'Mesa', 'ItemPedido', 'ModificadorItemPedido',
  'MetodoPago', 'Pago', 'TurnoCaja', 'ConfiguracionImpresora', 'ConfiguracionEmpresa'
];

modelsToAddIds.forEach(model => {
  const regex = new RegExp(`(model ${model} \\{[\\s\\S]*?id\\s+String\\s+@id @default\\(uuid\\(\\)\\))`, 'g');
  schema = schema.replace(regex, `$1\n  /// Identificador secundario legible para humanos y uso en frontend/caja\n  ids             Int              @unique @default(autoincrement())`);
});

fs.writeFileSync(schemaPath, schema);
console.log('schema.prisma actualizado con el campo ids en todos los modelos solicitados.');
