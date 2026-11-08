const sql = require('mssql');

const databaseName = process.env.DB_DATABASE ?? 'AgendaVital';

if (!/^[A-Za-z0-9_]+$/.test(databaseName)) {
  throw new Error('DB_DATABASE contiene caracteres no permitidos.');
}

async function createDatabase() {
  const pool = await sql.connect({
    server: process.env.DB_SERVER,
    port: Number(process.env.DB_PORT ?? 1433),
    database: 'master',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  });

  await pool.request().query(`
    IF DB_ID(N'${databaseName}') IS NULL
    BEGIN
      CREATE DATABASE [${databaseName}];
    END
  `);

  await pool.close();
  console.log(`Base de datos ${databaseName} disponible.`);
}

createDatabase().catch((error) => {
  console.error('No fue posible preparar la base de datos:', error.message);
  process.exit(1);
});
