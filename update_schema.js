const fs = require('fs');
const path = 'c:/02 SISTEMAS/gastrosuite/backend/prisma/schema.prisma';
let schema = fs.readFileSync(path, 'utf8');

const oldModels = `model Region {
  id       Int       @id @default(autoincrement())
  nombre   String
  comunas  Comuna[]
  usuarios Usuario[]

  @@map("regiones")
}

model Comuna {
  id       Int       @id @default(autoincrement())
  nombre   String
  regionId Int
  region   Region    @relation(fields: [regionId], references: [id])
  usuarios Usuario[]

  @@index([regionId], map: "comunas_regionId_fkey")
  @@map("comunas")
}`;

const newModels = `model Region {
  id_region     Int       @id @default(autoincrement())
  descripcion   String?   @db.VarChar(100)
  estado_region String?   @db.VarChar(50)
  ciudades      Ciudad[]
  usuarios      Usuario[]

  @@map("region")
}

model Ciudad {
  id_ciudad     Int       @id @default(autoincrement())
  descripcion   String?   @db.VarChar(100)
  estado_ciudad String?   @db.VarChar(50)
  id_region     Int?
  region        Region?   @relation(fields: [id_region], references: [id_region])
  comunas       Comuna[]
  usuarios      Usuario[]

  @@index([id_region], map: "ciudad_id_region_fkey")
  @@map("ciudad")
}

model Comuna {
  id_comuna     Int       @id @default(autoincrement())
  descripcion   String?   @db.VarChar(100)
  estado_comuna String?   @db.VarChar(100)
  id_ciudad     Int?
  ciudad        Ciudad?   @relation(fields: [id_ciudad], references: [id_ciudad])
  usuarios      Usuario[]

  @@index([id_ciudad], map: "comuna_id_ciudad_fkey")
  @@map("comuna")
}`;

schema = schema.replace(oldModels, newModels);

// Update Usuario indexes
schema = schema.replace('@@index([comunaId], map: "usuarios_comunaId_fkey")', '@@index([comunaId], map: "usuarios_comunaId_fkey")\n  @@index([ciudadId], map: "usuarios_ciudadId_fkey")');

// Update Usuario
schema = schema.replace('  comunaId                   Int?', '  ciudadId                   Int?\n  comunaId                   Int?');
schema = schema.replace('  comuna                     Comuna?      @relation(fields: [comunaId], references: [id])', '  comuna                     Comuna?      @relation(fields: [comunaId], references: [id_comuna])');
schema = schema.replace('  region                     Region?      @relation(fields: [regionId], references: [id])', '  region                     Region?      @relation(fields: [regionId], references: [id_region])\n  ciudad                     Ciudad?      @relation(fields: [ciudadId], references: [id_ciudad])');

fs.writeFileSync(path, schema);
console.log('Schema updated');
