const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection('mysql://gastro_admin:lucas06122012@129.121.36.186:3306/gastrosuite_db');
  
  try {
    console.log('Connected. Altering table to VARCHAR...');
    await connection.execute("ALTER TABLE mesas MODIFY COLUMN estado VARCHAR(50)");
    
    console.log('Updating records...');
    await connection.execute("UPDATE mesas SET estado = 'D' WHERE estado = 'LIBRE'");
    await connection.execute("UPDATE mesas SET estado = 'CS' WHERE estado = 'CUENTA_PEDIDA'");
    await connection.execute("UPDATE mesas SET estado = 'R' WHERE estado = 'RESERVADA'");
    await connection.execute("UPDATE mesas SET estado = 'O' WHERE estado = 'OCUPADA'");
    await connection.execute("UPDATE mesas SET estado = 'L' WHERE estado = 'LIMPIANDO'");
    
    console.log('Done mapping old values. Now you can run Prisma db push safely.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
