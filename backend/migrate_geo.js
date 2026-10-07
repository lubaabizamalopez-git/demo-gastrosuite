const fs = require('fs');
const mysql = require('mysql2/promise');

async function run() {
  const env = fs.readFileSync('.env', 'utf8');
  const urlMatch = env.match(/DATABASE_URL="([^"]+)"/);
  if (!urlMatch) {
    console.error("DATABASE_URL not found");
    return;
  }
  const url = urlMatch[1];
  
  const connection = await mysql.createConnection(url);
  
  const sql = fs.readFileSync('C:/Users/PC/Downloads/pionero(1).sql', 'utf8');
  const regex = /INSERT INTO `(?:region|ciudad|comuna)`.*?(?:;)/gs;
  const statements = sql.match(regex);
  
  await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
  await connection.query('TRUNCATE TABLE `comuna`;');
  await connection.query('TRUNCATE TABLE `ciudad`;');
  await connection.query('TRUNCATE TABLE `region`;');
  
  for (let stmt of statements) {
    await connection.query(stmt);
  }
  await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
  await connection.end();
  console.log('Migrated data from pionero!');
}
run().catch(console.error);
